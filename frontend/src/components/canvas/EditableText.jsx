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
  const isFocusedRef = useRef(false)

  // Parse markdown bold (**text** / __text__) and italic (*text* / _text_)
  const getFormattedHtml = (val) => {
    if (!val) return ''
    let escaped = val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Bold: **text** or __text__
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Italic: *text* or _text_
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>')
    escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>')
    
    return escaped
  }

  useEffect(() => {
    if (ref.current && !isFocusedRef.current) {
      ref.current.innerHTML = getFormattedHtml(value) || ''
    }
  }, [value])

  const handleFocus = () => {
    isFocusedRef.current = true
    if (ref.current) {
      // Show raw text with Markdown syntax while editing
      ref.current.innerText = value || ''
    }
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    if (ref.current) {
      const text = ref.current.innerText
      onChange(text)
      // Render formatted bold/italic html on blur
      ref.current.innerHTML = getFormattedHtml(text) || ''
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      {...props}
    />
  )
}
