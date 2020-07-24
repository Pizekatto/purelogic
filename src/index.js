import './styles/main.sass'

const collapseMenuRes = 1280
const collapseMenuMediaQuery = `(min-width: ${collapseMenuRes}px)`
const switchMenu = window.matchMedia(collapseMenuMediaQuery)

const switchCollapsed = () => {
  const state = window.innerWidth < collapseMenuRes
  menu.isCollapsed = state
  menu.elem.classList.toggle('menu-lg', !state)
  controls.elem.classList.toggle('controls-lg', !state)
  catalog.elem.classList.toggle('mobile', state)
  catalog.title.classList.toggle('mobile', state)

  renderControls()
}

switchMenu.onchange = switchCollapsed

let data = {}

const menu = {
  elem: document.getElementById('menu'),
  isCollapsed: false,
  isOpen: false,
  data: null
}
const controls = {
  elem: document.getElementById('controls')
}
const catalog = {
  elem: document.getElementById('catalog'),
  title: document.getElementById('list-title'),
  data: null
}
const sidebar = {
  elem: document.getElementById('sidebar'),
  burger: {
    elem: document.getElementById('burger')
  }
}
const header = {
  elem: document.getElementById('header'),
  navigation: {
    elem: document.getElementById('navigation')
  }
}
const logo = {
  elem: document.getElementById('logo')
}
const back = {
  elem: document.getElementById('back'),
  position: 0,
  stage: 0
}

sidebar.burger.elem.onclick = () => {
  header.elem.classList.toggle('show-menu')
  menu.isOpen = !menu.isOpen
  sidebar.burger.elem.classList.toggle('open', menu.isOpen)
  sidebar.elem.classList.remove('show-list')
  header.elem.classList.remove('hide')
  logo.elem.classList.remove('hide')
  back.elem.classList.remove('show')
  back.stage = 0

  loadCatalog(catalog.data)(createCatalog)
}

menu.elem.onclick = (event) => {
  const item = event.target.closest('li')
  header.elem.classList.add('hide')
  sidebar.elem.classList.add('show-list')
  logo.elem.classList.add('hide')
  back.elem.classList.add('show')
  back.stage++
    back.position = item.dataset.index
}

catalog.elem.onclick = () => {
  const item = event.target.closest('li')
  back.stage++
    back.position = item.dataset.index
  loadCatalog(catalog.data.data[back.position])(createCatalogList)
}

back.elem.onclick = () => {
  back.stage--
    switch (back.stage) {
      case 0:
        logo.elem.classList.remove('hide')
        back.elem.classList.remove('show')
        sidebar.elem.classList.remove('show-list')
        header.elem.classList.remove('hide')
        header.elem.classList.add('show-menu')
        break
      case 1:
        loadCatalog(catalog.data)(createCatalog)
        break
      case 2:
        loadCatalog(catalog.data.data[4])(createCatalogList)
        break
    }
}

const cleanCatalog = element => list => createfunc => {
  while (element.firstElementChild.nextElementSibling) {
    element.firstElementChild.nextElementSibling.remove()
  }
  element.firstElementChild.firstElementChild.textContent = list.title
  insertList(element, createfunc(list))
}
const loadCatalog = cleanCatalog(catalog.elem)


const getData = async() => {
  const response = await fetch('../assets/menu-data.json')
  data = await response.json()
}

const createList = callback => ({ title, data = [] }) => {
  const listItems = Object.values(data)
  return listItems.map((elem, index) => {
    const listElem = document.createElement('li')
    listElem.dataset.index = index
    callback(elem, index, listElem, title)
    return listElem
  })
}

const createMenu = createList((elem, index, listElem) => {
  if (elem.data) { listElem.classList.add('has-entries') }
  const content = `
    <a href="#" class="menu-link">${elem.title}</a>
  `
  listElem.insertAdjacentHTML('beforeend', content)
})

const createControls = createList((elem, index, listElem) => {
  listElem.className = 'controls-item'
  if (elem.message) {
    listElem.classList.add('has-message')
  }
  const image = !menu.isCollapsed ? index : `${index}-dark`
  const content = `
    <a href="#" class="controls-item__link">
      <div class="controls-item__icon" data-message="${elem.message || ''}">
        <img src="./assets/images/controls/${image}.svg" class="controls-item__image" alt="controls-item">
      </div>
      <span class="controls-item__title">${elem.title}</span>
    </a>
  `
  listElem.insertAdjacentHTML('beforeend', content)
})

const createCatalog = createList((elem, index, listElem) => {
  listElem.className = 'catalog-item'
  const content = `
    <a href="#" class="catalog-item__link">
      <div class="catalog-item__icon">
        <img src="./assets/images/catalog/${index + 1}.svg" alt="catalog-item-${index + 1}" class="catalog-item__icon-image">
      </div>
      <div class="catalog-item__title">${elem.title}</div>
    </a>
  `
  if (elem.accent) { listElem.classList.add('accent') }
  listElem.insertAdjacentHTML('beforeend', content)
})

const createCatalogList = createList((elem, index, listElem) => {
  listElem.className = 'catalog-item'
  const content = `
    <a href="#" class="catalog-item__link">
      <div class="catalog-item__icon">
        <img src="./assets/images/catalog/4/${index % 3}.svg" alt="catalog-item-${index}" class="catalog-item__icon-image">
      </div>
      <div class="catalog-item__title">${elem.title}</div>
    </a>
  `
  if (elem.accent) { listElem.classList.add('accent') }
  listElem.insertAdjacentHTML('beforeend', content)
})

const renderControls = () => {
  while (controls.elem.firstChild) {
    controls.elem.firstChild.remove()
  }
  insertList(controls.elem, createControls(data.controls))
}

const insertList = (target, list) => {
  list.forEach(item => target.append(item))
}


const render = async() => {
  await getData()
  switchCollapsed()
  menu.data = data.menu
  catalog.data = data.menu.data.catalog
  insertList(menu.elem, createMenu(menu.data))
  insertList(catalog.elem, createCatalog(catalog.data))
}

render()