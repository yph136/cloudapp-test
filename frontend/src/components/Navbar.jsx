const LINKS = [
  { key: 'index.html', href: './index.html', label: '首页' },
  { key: 'users.html', href: './users.html', label: '用户管理' },
  { key: 'todos.html', href: './todos.html', label: '待办清单' },
  { key: 'about.html', href: './about.html', label: '关于项目' }
]

export default function Navbar({ current }) {
  return (
    <nav className="navbar">
      <span className="logo">CloudBase Demo</span>
      {LINKS.map((l) => (
        <a
          key={l.key}
          className={'nav-link' + (l.key === current ? ' active' : '')}
          href={l.href}
          aria-current={l.key === current ? 'page' : undefined}
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}
