export function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td className="px-3 py-4 text-center text-sm text-slate-500" colSpan={colSpan}>
        {text}
      </td>
    </tr>
  );
}