const { trimEnd, endsWith } = require('lodash')
const db = require('../db/mysql')
 
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
      tableName: 'all_users',
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
    return await db.query(`select * from status_type`)
  }
  async getUsersGrades() {
    return await db.query(`select * from grade_type`);
  }
  async deleteUserValidate(params) {
    const { id } = params;
    // 1, 判断是否存在购买该种险种的客户
    const selectById = await db.query(`select * from user_insurance where user_id='${id}'`);
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
    const selInsurance = await db.query(`select * from user_insurance where user_id='${id}'`);
    if (selInsurance.results?.length) {
      const delInsurance = await db.query(`delete from user_insurance where user_id=${id}`);
      if (200 !== delInsurance.code) {
        return delInsurance;
      }
    }
    // special_days 表 删除
    const selSpecialDays = await db.query(`select * from special_days where user_id='${id}'`);
    if (selSpecialDays.results?.length) {
      const delSpecialDays = await db.query(`delete from special_days where user_id=${id}`);
      if (200 !== delSpecialDays.code) {
        return delSpecialDays;
      }
    }
    // all_users 表 删除
    return await db.query(`delete from all_users where id=${id}`);
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
    const selPhone = await db.query(`select * from all_users where phone='${phone}'`);
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
    const addUser = await db.query(this.insertSQL('all_users', userColumns));
    if (200 !== addUser.code) {
      return addUser;
    }

    // 2, 获取刚刚添加的用户的 id
    const getUser = await db.query(`select * from all_users where phone='${phone}'`);
    const user_id = getUser.results?.[0]?.id;
    if (200 !== getUser.code && !user_id) {
      return getUser;
    } else if (user_id) {
      // 3, special_days 表 添加
      if (specialDays?.length) {
        const special_query = this.insertMoreSQL('special_days', ['name', 'date'], user_id, specialDays);
        
        const addSpecialDays = await db.query(special_query);
        if (200 !== addSpecialDays.code) {
          return addSpecialDays;
        }
      }
  
      // 4, user_insurance 表 添加
      if (insurances?.length) {
        const insurance_query = this.insertMoreSQL('user_insurance', ['insurance_id', 'insurance_name', 'start_time', 'end_time', 'first_money', 'com_money'], user_id, insurances);

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
    const selSpecialDays = await db.query(`select * from special_days where user_id=${id}`);
    if (200 !== selSpecialDays.code) {
      return selSpecialDays;
    }

    // 2, user_insurance 表 查询
    const selInsurance = await db.query(`select * from user_insurance where user_id=${id}`);
    if (200 !== selInsurance.code) {
      return selInsurance;
    }

    // 3, all_users 表 查询
    const selUser = await db.query(`select * from all_users where id=${id}`);
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
    const updateUser = await db.query(`update all_users set ${this.updateColumnFormat(Object.keys(userColumns), userColumns)} where id=${id}`);
    if (200 !== updateUser.code) {
      return updateUser;
    }

    // 2, special_days 表 更新
    if (specialDays?.length) {
      const updateColumns = ['name', 'date'];
      const updateSpecialDays = await this.editSecondaryTable('special_days', id, specialDays, updateColumns);
      if (200 !== updateSpecialDays.code) {
        return updateSpecialDays;
      }
    }

    // 3, user_insurance 表 更新
    if (insurances?.length) {
      const updateColumns = ['insurance_id', 'insurance_name', 'start_time', 'end_time', 'first_money', 'com_money'];
      const updateInsurances = await this.editSecondaryTable('user_insurance', id, insurances, updateColumns);
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
    return await db.query(`select * from insurance_type`);
  }
  async addInsurance(reqParams) {
    const { name, type, cycle } = reqParams;
    // 1, 判断是否存在同名保险
    const selectByName = await db.query(`select * from insurance_msg where name='${name}'`);
    if (selectByName.results?.length) {
      return {
        code: 5001,
        message: '已存在同名保险!',
      }
    }
    // 2, 不存在同名保险则直接添加
    return await db.query(`insert into insurance_msg(name, type, cycle) values ('${name}', '${type}', '${cycle}')`);
  }
  async insuranceList(params) {
    // params: pageNum, pageSize, searchValue
    const queryObj = {
      tableName: 'insurance_msg',
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
    const selInsurance = await db.query(`select * from user_insurance where insurance_id='${id}'`);
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
    const selInsurance = await db.query(`select * from user_insurance where insurance_id='${id}'`);
    if (selInsurance.results?.length) {
      const delInsurance = await db.query(`delete from user_insurance where insurance_id=${id}`);
      if (200 !== delInsurance.code) {
        return delInsurance;
      }
    }
    // 主表(insurance_msg) 中删除
    return await db.query(`delete from insurance_msg where id=${id}`);
  }
  async insuranceDetail(params) {
    const { id } = params;
    return await db.query(`select * from insurance_msg where id='${id}'`);
  }
  async editInsurance(reqParams) {
    const { id, name, type, cycle } = reqParams;
    // 1, 判断是否存在同名保险
    const selectByName = await db.query(`select * from insurance_msg where name='${name}'`);
    if (selectByName.results?.length && id !== selectByName.results[0]?.id) {
      return {
        code: 5001,
        message: '已存在同名保险!',
      }
    }
    // 2, 不存在同名保险则直接添加
    return await db.query(`update insurance_msg set name='${name}', type='${type}', cycle='${cycle}' where id=${id}`);
  }
}
 
module.exports = new CommonModel()