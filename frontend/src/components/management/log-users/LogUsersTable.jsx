import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';
import { UserPagination } from '../users/UserPagination.jsx';

const columns = Object.freeze(['USERNAME', 'ROLE', 'ACTION TYPE', 'MODULE', 'STATUS', 'DETAILS']);

export function LogUsersTable({ logs, theme = 'light', currentPage = 1, totalPages = 1, onPageChange, onDetails }) {
  const isDark = theme === 'dark';

  return (
    <section
      className={clsx(
        'mt-5 min-h-95 w-full min-w-0 max-w-full overflow-hidden rounded-xl px-4 py-4 sm:mt-6 sm:min-h-105 sm:px-7 sm:py-5',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'border-b border-[#1d262e]' : 'border-b border-[#c8d4e7]'}>
              {columns.map((column) => (
                <th
                  key={column}
                  className={clsx(
                    'px-6 pb-3 text-xs font-extrabold tracking-wide sm:text-sm',
                    isDark ? 'text-[#f4f1ec]' : 'text-[#6d8bb3]'
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={clsx(
                    'transition',
                    isDark
                      ? 'text-[#f4f1ec] hover:bg-[#56616d]/35'
                      : 'text-[#86a0c3] hover:bg-[#f4f7fb]'
                  )}
                >
                  <td className="px-6 py-3 font-bold">{log.username}</td>
                  <td className="px-6 py-3 font-bold">{log.role}</td>
                  <td className="px-6 py-3 font-bold">{log.action_type}</td>
                  <td className="px-6 py-3 font-bold">{log.module}</td>
                  <td className="px-6 py-3 font-bold">{log.status}</td>
                  <td className="px-6 py-2">
                    <button
                      type="button"
                      className={clsx(
                        'h-8 min-w-20 rounded-md px-4 text-sm font-medium transition hover:-translate-y-0.5',
                        isDark
                          ? 'bg-[#4b5561] text-[#f4f1ec] hover:bg-[#31527d]'
                          : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
                      )}
                      onClick={() => onDetails?.(log)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="grid min-h-80 place-items-center">
                    <div className="grid justify-items-center gap-4 text-center">
                      <AppIcon
                        name="inbox"
                        className={clsx(
                          'text-[3.5rem]',
                          isDark ? 'text-[#929da8]' : 'text-[#c9d4e4]'
                        )}
                      />
                      <p
                        className={clsx(
                          'm-0 font-semibold',
                          isDark ? 'text-[#cfd8e3]' : 'text-[#c9d4e4]'
                        )}
                      >
                        Tidak ada log users
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        theme={theme}
        onPageChange={onPageChange}
      />
    </section>
  );
}
