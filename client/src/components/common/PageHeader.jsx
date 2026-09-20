import Breadcrumb from './Breadcrumb';

export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
