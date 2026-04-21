export default function Table({ children, className = "", ...props }) {
  return (
    <table className={["ui-table", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </table>
  );
}

export function TableScroll({ children, className = "", ...props }) {
  return (
    <div
      className={["ui-table-scroll", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function TableShell({
  children,
  className = "",
  scrollClassName = "",
}) {
  return (
    <div className={["ui-table-shell", className].filter(Boolean).join(" ")}>
      <TableScroll className={scrollClassName}>{children}</TableScroll>
    </div>
  );
}

export function TableEmptyRow({
  colSpan,
  message = "Kayıt bulunamadı.",
  className = "",
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={["ui-table__empty", className].filter(Boolean).join(" ")}>
        {message}
      </td>
    </tr>
  );
}
