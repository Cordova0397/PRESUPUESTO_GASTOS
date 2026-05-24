import { EmptyState } from "./EmptyState";

type Props = {
  colSpan: number;
  message: string;
  title?: string;
};

export function TableEmptyRow({ colSpan, message, title }: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10">
        <EmptyState message={message} title={title} compact />
      </td>
    </tr>
  );
}
