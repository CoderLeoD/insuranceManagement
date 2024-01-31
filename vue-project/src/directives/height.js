function siblings(elm) {
  var a = [] //保存所有兄弟节点
  var p =  elm && elm.parentNode.children //获取父级的所有子节点
  for (var i = 0; i < p.length; i++) { //循环
    if (p[i].nodeType == 1 && p[i] != elm) { //如果该节点是元素节点与不是这个节点本身
      a.push(p[i]) // 添加到兄弟节点里
    }
  }
  return a
}

export default function(app) {
  app.directive("height", {
      mounted: function(el, bind) {
        // 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)
        const parentNodesH = el.parentNode.clientHeight
        const nodes = document.getElementById(el.id)
        const sibNodes = siblings(nodes)
        let exitH = 0
        sibNodes.forEach(el => {
          exitH += el.clientHeight
        })
        el.style.height = parentNodesH - exitH + 'px'
      }
    })
  }
