export function Button({ children, ...props }) {
  return <button className='border px-4 py-2 rounded' {...props}>{children}</button>
}