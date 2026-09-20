import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../utils/constants';
import { titleCase } from '../../utils/formatters';

export default function PermissionMatrix({ value = [], onChange, disabled }) {
  const has = (perm) => value.includes(perm);

  const toggle = (perm) => {
    if (disabled) return;
    onChange(has(perm) ? value.filter((p) => p !== perm) : [...value, perm]);
  };

  const toggleRow = (module) => {
    if (disabled) return;
    const rowPerms = PERMISSION_ACTIONS.map((a) => `${module}.${a}`);
    const allOn = rowPerms.every((p) => has(p));
    onChange(allOn ? value.filter((p) => !rowPerms.includes(p)) : Array.from(new Set([...value, ...rowPerms])));
  };

  return (
    <div className="perm-matrix-wrap">
      <table className="perm-matrix">
        <thead>
          <tr>
            <th>Module</th>
            {PERMISSION_ACTIONS.map((a) => <th key={a}>{titleCase(a)}</th>)}
            <th>All</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((module) => (
            <tr key={module}>
              <td>{titleCase(module)}</td>
              {PERMISSION_ACTIONS.map((action) => {
                const perm = `${module}.${action}`;
                return (
                  <td key={perm}>
                    <input type="checkbox" checked={has(perm)} onChange={() => toggle(perm)} disabled={disabled} />
                  </td>
                );
              })}
              <td>
                <input
                  type="checkbox"
                  checked={PERMISSION_ACTIONS.every((a) => has(`${module}.${a}`))}
                  onChange={() => toggleRow(module)}
                  disabled={disabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
