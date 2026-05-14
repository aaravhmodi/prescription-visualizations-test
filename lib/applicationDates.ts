export interface ApplicationEvent {
  index: number
  date: string
  display: string
}

export const APPLICATION_EVENTS: ApplicationEvent[] = [
  { index: 1, date: '2025-06-30', display: 'Jun 30' },
  { index: 2, date: '2025-07-12', display: 'Jul 12' },
  { index: 3, date: '2025-07-22', display: 'Jul 22' },
  { index: 4, date: '2025-08-04', display: 'Aug 4' },
  { index: 5, date: '2025-08-19', display: 'Aug 19' },
  { index: 6, date: '2025-09-03', display: 'Sep 3' },
  { index: 7, date: '2025-09-14', display: 'Sep 14' },
  { index: 8, date: '2025-10-01', display: 'Oct 1' },
]
