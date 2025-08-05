export function Label({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className='font-semibold'>{children}</label>
}