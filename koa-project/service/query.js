const { trimEnd, endsWith } = require('lodash')
const db = require('../db/mysql')

const dbTableNames = {
  allUsers: 'all_users',
  gradeType: 'grade_type',
  insuranceMsg: 'insurance_msg',
  insuranceType: 'insurance_type',
  specialDays: 'special_days',
  statusType: 'status_type',
  userInsurance: 'user_insurance',
}
 
class CommonModel {
  getListQuery(queryObj) {
    const {tableName, searchTitle, searchValue, pageNum, pageSize} = queryObj;
    let queryStr = "";
    if (searchValue && pageNum && pageSize) {
      queryStr = `select * from ${tableName} where ${searchTitle} LIKE '%${searchValue}%' limit ${(pageNum - 1) * pageSize}, ${pageSize}`;
    } else if (pageNum && pageSize) {
      queryStr = `select * from ${tableName} limit ${(pageNum - 1) * pageSize}, ${pageSize}`;
    } else {
      queryStr = `select * from ${tableName}`;
    }
    return queryStr;
  }
  getTotalQuery(tableName) {
    return `select COUNT(*) AS total_count from ${tableName}`;
  }
  /**
   * users
   */
  async getAllUsers(params) {
    // params: pageNum, pageSize, searchValue
    const queryObj = {
      tableName: dbTableNames.allUsers,
      searchTitle: 'user',
      ...params,
    }
    const queryData = await db.query(this.getListQuery(queryObj));
    const total = await db.query(this.getTotalQuery(queryObj.tableName));
    const isSuccess = 200 === queryData.code && 200 === total.code;
    return {
      code: isSuccess ? 200 : 500,
      results: {
        total: total.results?.[0]?.total_count,
        data: queryData.results,
      }
    };
  }
  async getUsersStatus() {
    return await db.query(`select * from ${dbTableNames.statusType}`)
  }
  async getUsersGrades() {
    return await db.query(`select * from ${dbTableNames.gradeType}`);
  }
  async deleteUserValidate(params) {
    const { id } = params;
    // 1, 判断是否存在购买该种险种的客户
    const selectById = await db.query(`select * from ${dbTableNames.userInsurance} where user_id='${id}'`);
    if (selectById.results?.length) {
      return {
        code: 200,
        messageCode: 2001,
        message: '该用户存在已购买保险, 是否继续删除?',
      }
    }
    // 2, 可以删除
    return {
      code: 200,
      messageCode: 2000,
      message: '数据可以删除, 删除后无法恢复!',
    }
  }
  async deleteUser(params) {
    const { id } = params;
    // 关联的表中删除数据, 两张关联表: user_insurance 和 special_days, 一张主表: all_users
    // user_insurance 表 删除
    const selInsurance = await db.query(`select * from ${dbTableNames.userInsurance} where user_id='${id}'`);
    if (selInsurance.results?.length) {
      const delInsurance = await db.query(`delete from ${dbTableNames.userInsurance} where user_id=${id}`);
      if (200 !== delInsurance.code) {
        return delInsurance;
      }
    }
    // special_days 表 删除
    const selSpecialDays = await db.query(`select * from ${dbTableNames.specialDays} where user_id='${id}'`);
    if (selSpecialDays.results?.length) {
      const delSpecialDays = await db.query(`delete from ${dbTableNames.specialDays} where user_id=${id}`);
      if (200 !== delSpecialDays.code) {
        return delSpecialDays;
      }
    }
    // all_users 表 删除
    return await db.query(`delete from ${dbTableNames.allUsers} where id=${id}`);
  }
  // 动态的 insert, 一次添加一条
  insertSQL(tableName, columnsObj) {
    let col_str = '', val_str = '';
    for (const key in columnsObj) {
      if (Object.hasOwnProperty.call(columnsObj, key)) {
        const value = columnsObj[key];
        if (value) {
          col_str += `${key},`;
          val_str += `'${value}',`;
        }
      }
    }
    col_str = trimEnd(col_str, ',');
    val_str = trimEnd(val_str, ',');
    return `INSERT INTO ${tableName} (${col_str}) VALUES (${val_str})`;
  }
  // 全量的 insert, 一次添加多条, 值不存在时, 设置默认值
  insertMoreSQL(tableName, columns, user_id, dataSource) {
    /**
     * tableName, columns, user_id, dataSource
     * 
     * columns: 
     * [ insurance_id, insurance_name, start_time, end_time, first_money, com_money ]
     * [ name, date ]
     * 
     * 添加全部字段, 没有是给默认值
     */
    let query_str = '';
    dataSource?.forEach(ele => {
      let values = '';
      columns.forEach(col => {
        values += (endsWith(col, 'id') ? `${ele[col] || null},` : `'${ele[col] || ''}',`);
      })
      query_str += `(${user_id}, ${trimEnd(values, ',')}),`;
    });
    return `INSERT INTO ${tableName} (user_id, ${columns.join(',')}) VALUES ${trimEnd(query_str, ',')}`;
  }
  async addUser(params) {
    /**
     * 有三张表需要添加: all_users, user_insurance 和 special_days
     * 一条数据需要整理: address_city (前端传过来是数组, 数据库存储为字符串)
     */
    const { user, gender, age, phone, identity_num, status_type, grade_type, address_city, address_street, specialDays, insurances } = params;

    // 0, 先根据 phone 查询是否已存在对应客户
    const selPhone = await db.query(`select * from ${dbTableNames.allUsers} where phone='${phone}'`);
    if (200 !== selPhone.code) {
      return selPhone;
    } else if (200 === selPhone.code && selPhone.results.length) {
      return {
        code: 500,
        message: '该手机号用户已存在, 不必添加',
      };
    }

    // 1, all_users 表 添加
    const userColumns = {
      user,
      gender,
      age,
      phone,
      identity_num,
      status_type,
      grade_type,
      address_city: JSON.stringify(address_city),
      address_street,
    }
    const addUser = await db.query(this.insertSQL(dbTableNames.allUsers, userColumns));
    if (200 !== addUser.code) {
      return addUser;
    }

    // 2, 获取刚刚添加的用户的 id
    const getUser = await db.query(`select * from ${dbTableNames.allUsers} where phone='${phone}'`);
    const user_id = getUser.results?.[0]?.id;
    if (200 !== getUser.code && !user_id) {
      return getUser;
    } else if (user_id) {
      // 3, special_days 表 添加
      if (specialDays?.length) {
        const special_query = this.insertMoreSQL(dbTableNames.specialDays, ['name', 'date'], user_id, specialDays);
        
        const addSpecialDays = await db.query(special_query);
        if (200 !== addSpecialDays.code) {
          return addSpecialDays;
        }
      }
  
      // 4, user_insurance 表 添加
      if (insurances?.length) {
        const insurance_query = this.insertMoreSQL(dbTableNames.userInsurance, ['insurance_id', 'insurance_name', 'start_time', 'end_time', 'first_money', 'com_money'], user_id, insurances);

        const addInsurances = await db.query(insurance_query);
        if (200 !== addInsurances.code) {
          return addInsurances;
        }
      }
  
      // 5, 添加用户成功
      return addUser;
    } else {
      return {
        code: 500,
        message: '纪念日/已购险种 添加失败, 请先返回客户列表, 再编辑当前用户!'
      }
    }
  }
  async getUserDetail(params) {
    /**
     * 有三张表需要添加: all_users, user_insurance 和 special_days
     * 一条数据需要整理: address_city (前端传过来是数组, 数据库存储为字符串)
     */
    const { id } = params;

    // 1, special_days 表 查询
    const selSpecialDays = await db.query(`select * from ${dbTableNames.specialDays} where user_id=${id}`);
    if (200 !== selSpecialDays.code) {
      return selSpecialDays;
    }

    // 2, user_insurance 表 查询
    const selInsurance = await db.query(`select * from ${dbTableNames.userInsurance} where user_id=${id}`);
    if (200 !== selInsurance.code) {
      return selInsurance;
    }

    // 3, all_users 表 查询
    const selUser = await db.query(`select * from ${dbTableNames.allUsers} where id=${id}`);
    if (200 !== selUser.code) {
      return selUser;
    }

    // 4, 返回数据
    return {
      code: 200,
      data: {
        ...selUser.results?.[0],
        specialDays: selSpecialDays.results,
        insurances: selInsurance.results,
      }
    };
  }
  async delNotInDataSource(tableName, userId, dataSource) {
    const currentIds = [], deleteIds = [];
    dataSource.filter(v => v.id).forEach(v => {
      currentIds.push(v.id)
    })
    const selTable = await db.query(`select * from ${tableName} where user_id='${userId}'`);
    if (200 !== selTable.code) {
      return selTable;
    }
    selTable.results?.forEach(v => {
      if (!currentIds.includes(v.id)) {
        deleteIds.push(v.id)
      }
    })
    if (deleteIds.length) {
      const delTable = await db.query(`DELETE FROM ${tableName} WHERE id IN (${deleteIds.join(', ')})`);
      if (200 !== delTable.code) {
        return delTable;
      }
    }
    return {
      code: 200
    }
  }
  // 动态的 更新 sql字段
  updateColumnFormat(columns, ele) {
    let update_col = '';
    columns.forEach(v => {
      if (ele[v]) {
        update_col += endsWith(v, 'id') ? `${v}=${ele[v]},` : `${v}='${ele[v]}',`;
      }
    })
    update_col = trimEnd(update_col, ',');
    return update_col;
  }
  async editSecondaryTable(tableName, user_id, dataSource, columns) {
    // 删除不在数据源中的元素
    const del = await this.delNotInDataSource(tableName, user_id, dataSource);
    if (200 !== del.code) {
      return del;
    }
    // 更新 和 添加 操作
    for (let i = 0; i < dataSource.length; i++) {
      const ele = dataSource[i];
      let queryRes;
      // 是否存在 id
      if (ele.id) {
        // id 存在, 则 更新
        queryRes = await db.query(`update ${tableName} set ${this.updateColumnFormat(columns, ele)} where id=${ele.id}`);
      } else {
        // id 不存在, 则 添加
        const columnsObj = {
          user_id,
        }
        columns.forEach(v => columnsObj[v] = ele[v]);
        queryRes = await db.query(this.insertSQL(tableName, columnsObj));
      }
      if (200 !== queryRes.code) {
        return queryRes;
      }
    }
    return {
      code: 200,
    }
  }
  async editUser(params) {
    /**
     * 有三张表需要添加: all_users, user_insurance 和 special_days
     * 一条数据需要整理: address_city (前端传过来是数组, 数据库存储为字符串)
     */
    const { id, user, gender, age, phone, identity_num, status_type, grade_type, address_city, address_street, specialDays, insurances } = params;

    // 1, all_users 表 更新
    // const updateUser = await db.query(`update all_users set user='${user}', gender='${gender}', age=${age}, phone='${phone}', identity_num='${identity_num}', status_type='${status_type}', grade_type='${grade_type}', address_city='${address_city_str}', address_street='${address_street}' where id=${id}`);
    const userColumns = {
      user,
      gender,
      age,
      phone,
      identity_num,
      status_type,
      grade_type,
      address_city: JSON.stringify(address_city),
      address_street,
    }
    const updateUser = await db.query(`update ${dbTableNames.allUsers} set ${this.updateColumnFormat(Object.keys(userColumns), userColumns)} where id=${id}`);
    if (200 !== updateUser.code) {
      return updateUser;
    }

    // 2, special_days 表 更新
    if (specialDays?.length) {
      const updateColumns = ['name', 'date'];
      const updateSpecialDays = await this.editSecondaryTable(dbTableNames.specialDays, id, specialDays, updateColumns);
      if (200 !== updateSpecialDays.code) {
        return updateSpecialDays;
      }
    }

    // 3, user_insurance 表 更新
    if (insurances?.length) {
      const updateColumns = ['insurance_id', 'insurance_name', 'start_time', 'end_time', 'first_money', 'com_money'];
      const updateInsurances = await this.editSecondaryTable(dbTableNames.userInsurance, id, insurances, updateColumns);
      if (200 !== updateInsurances.code) {
        return updateInsurances;
      }
    }

    // 4, 更新用户成功
    return updateUser;
  }

  /**
   * insurance
   */
  async getInsuranceType() {
    return await db.query(`select * from ${dbTableNames.insuranceType}`);
  }
  async addInsurance(reqParams) {
    const { name, type, cycle } = reqParams;
    // 1, 判断是否存在同名保险
    const selectByName = await db.query(`select * from ${dbTableNames.insuranceMsg} where name='${name}'`);
    if (selectByName.results?.length) {
      return {
        code: 5001,
        message: '已存在同名保险!',
      }
    }
    // 2, 不存在同名保险则直接添加
    return await db.query(`insert into ${dbTableNames.insuranceMsg}(name, type, cycle) values ('${name}', '${type}', '${cycle}')`);
  }
  async insuranceList(params) {
    // params: pageNum, pageSize, searchValue
    const queryObj = {
      tableName: dbTableNames.insuranceMsg,
      searchTitle: 'name',
      ...params,
    }
    const queryData = await db.query(this.getListQuery(queryObj));
    const total = await db.query(this.getTotalQuery(queryObj.tableName));
    const isSuccess = 200 === queryData.code && 200 === total.code;
    return {
      code: isSuccess ? 200 : 500,
      results: {
        total: total.results?.[0]?.total_count,
        data: queryData.results,
      }
    };
  }
  async deleteInsuranceValidate(params) {
    const { id } = params;
    // 1, 判断是否存在购买该种险种的客户
    const selInsurance = await db.query(`select * from ${dbTableNames.userInsurance} where insurance_id='${id}'`);
    if (selInsurance.results?.length) {
      return {
        code: 200,
        messageCode: 2001,
        message: '该险种存在购买用户, 不能删除!',
      }
    }
    // 2, 可以删除
    return {
      code: 200,
      messageCode: 2000,
      message: '数据可以删除, 删除后无法恢复!',
    }
  }
  async deleteInsurance(params) {
    const { id } = params;
    // 关联表中删除 user_insurance
    // user_insurance 表 删除
    const selInsurance = await db.query(`select * from ${dbTableNames.userInsurance} where insurance_id='${id}'`);
    if (selInsurance.results?.length) {
      const delInsurance = await db.query(`delete from ${dbTableNames.userInsurance} where insurance_id=${id}`);
      if (200 !== delInsurance.code) {
        return delInsurance;
      }
    }
    // 主表(insurance_msg) 中删除
    return await db.query(`delete from ${dbTableNames.insuranceMsg} where id=${id}`);
  }
  async insuranceDetail(params) {
    const { id } = params;
    return await db.query(`select * from ${dbTableNames.insuranceMsg} where id='${id}'`);
  }
  async editInsurance(reqParams) {
    const { id, name, type, cycle } = reqParams;
    // 1, 判断是否存在同名保险
    const selectByName = await db.query(`select * from ${dbTableNames.insuranceMsg} where name='${name}'`);
    if (selectByName.results?.length && id !== selectByName.results[0]?.id) {
      return {
        code: 5001,
        message: '已存在同名保险!',
      }
    }
    // 2, 不存在同名保险则直接添加
    return await db.query(`update ${dbTableNames.insuranceMsg} set name='${name}', type='${type}', cycle='${cycle}' where id=${id}`);
  }
  /**
   * remind
   */
  async getRemindList() {
    /**
     * 有两张表 special_days 和 user_insurance, 需查看表中 is_reminded 字段
     * 
     * is_reminded: 0, 无需提醒; 1, 需提醒, 未提醒; 2, 需提醒, 已提醒
     */
    // 1, 获取 special_days 表需要提醒数据
    const selSpecialDays = await this.getTableRemindedByName(dbTableNames.specialDays);
    if (200 !== selSpecialDays.code) {
      return selSpecialDays;
    }
    // 2, 获取 user_insurance 表需要提醒数据
    const selUserInsurance = await this.getTableRemindedByName(dbTableNames.userInsurance);
    if (200 !== selUserInsurance.code) {
      return selUserInsurance;
    }
    return {
      code: 200,
      message: '获取所有提醒内容成功',
      results: [
        ...selSpecialDays.results,
        ...selUserInsurance.results,
      ],
    }
  }
  async getTableRemindedByName(tableName) {
    return await this.getRemindBySQL(`select * from ${tableName} where is_reminded>0`, tableName);
  }
  async getRemindBySQL(sqlStr, type) {
    const getReminded = await db.query(sqlStr);
    if (200 !== getReminded.code) {
      return getReminded;
    }
    const { results } = getReminded;
    const userRemindResults = [];
    for (let i = 0; i < results.length; i++) {
      const ele = results[i];
      // 获取用户信息
      const getUser = await db.query(`select * from ${dbTableNames.allUsers} where id=${ele.user_id}`);
      if (200 !== getUser.code) {
        return getUser;
      }
      const userMsg = getUser.results[0];
      userRemindResults.push({
        ...ele,
        ...userMsg,
        id: ele.id,
        type,
      });
    }
    return {
      code: 200,
      message: '获取 reminded 成功',
      results: userRemindResults,
    };
  }
  async getRemindDetail(params) {
    // type: special_days, user_insurance 就是表名
    const { id, type } = params;
    return await this.getRemindBySQL(`select * from ${type} where id=${id}`, type);
  }
  async updateRemind(params) {
    // type: special_days, user_insurance 就是表名
    const { id, type } = params;
    return await db.query(`update ${type} set is_reminded=2 where id=${id}`);
  }
  async refreshReminded() {
    /**
     * 每天 00:30 刷新 special_days 和 user_insurance 表中 is_reminded 字段
     * 
     * is_reminded: 0, 无需提醒; 1, 需提醒, 未提醒; 2, 需提醒, 已提醒
     */
    // 1, 获取 special_days 表的 date 字段, 判断是否需要提醒
    const updateSpecialDays = this.updateTableReminded(dbTableNames.specialDays, 'date');
    if (200 !== updateSpecialDays.code) {
      return updateSpecialDays;
    }
    // 2, 获取 user_insurance 表的 end_time 字段, 判断是否需要提醒
    const updateUserInsurance = this.updateTableReminded(dbTableNames.userInsurance, 'end_time', 31);
    if (200 !== updateUserInsurance.code) {
      return updateUserInsurance;
    }
    return {
      code: 200,
      message: '所有表 is_reminded 更新成功',
    }
  }
  async updateTableReminded(tableName, dateColName, advanceDays = 0) {
    const allTableData = await db.query(`select * from ${tableName}`);
    if (200 !== allTableData.code) {
      return allTableData;
    }
    const { results } = allTableData;
    const currentTime = new Date().getTime();
    for (let i = 0; i < results.length; i++) {
      const ele = results[i];
      const remindTime = ele[dateColName];
      if (currentTime >= (remindTime - advanceDays * 24 * 60 * 60 * 1000)) {
        // 是否已经提醒 ele.is_reminded
        if (!ele.is_reminded) {
          // 更新 is_reminded 字段值为 1
          const updateIsReminded = await db.query(`update ${tableName} set is_reminded=1 where id=${ele.id}`);
          if (200 !== updateIsReminded.code) {
            return updateIsReminded;
          }
        }
      }
    }
    return {
      code: 200,
      message: `${tableName} 表 is_reminded 更新成功`,
    }
  }
}
 
module.exports = new CommonModel()