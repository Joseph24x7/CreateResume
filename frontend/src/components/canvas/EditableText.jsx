import { useEffect, useRef } from 'react'

export default function EditableText({
  value,
  onChange,
  placeholder,
  className = '',
  tagName = 'span',
  singleLine = false,
  ...props
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value || ''
    }
  }, [value])

  const handleBlur = () => {
    if (ref.current) {
      const text = ref.current.innerText
      onChange(text)
    }
  }

  const handleInput = () => {
    if (ref.current) {
      const text = ref.current.innerText
      // Visual state for placeholder
      if (text.trim() === '') {
        ref.current.classList.add('is-empty')
      } else {
        ref.current.classList.remove('is-empty')
      }
    }
  }

  const handleKeyDown = (e) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault()
      ref.current.blur()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const Tag = tagName

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`editable-text ${className} ${!value || !value.trim() ? 'is-empty' : ''}`}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      {...props}
    />
  )
}
