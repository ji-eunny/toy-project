import { useState, useRef, useEffect } from 'react'
import { MdExpandMore } from 'react-icons/md'

interface StatusSelectProps {
  value: 'all' | 'protected' | 'ended'
  onChange: (value: 'all' | 'protected' | 'ended') => void
}

const StatusSelect = ({ value, onChange }: StatusSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options = [
    { value: 'all', label: '전체' },
    { value: 'protected', label: '보호중' },
    { value: 'ended', label: '종료' },
  ]

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '전체'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative w-40">
      {/* 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-dark font-bold text-sm flex items-center justify-between hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition shadow-sm"
      >
        <span>{selectedLabel}</span>
        <MdExpandMore
          className={`text-lg text-dark transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value as 'all' | 'protected' | 'ended')
                setIsOpen(false)
              }}
              className={`w-full px-5 py-3 text-left font-semibold text-sm transition ${
                value === option.value
                  ? 'bg-gray-200'
                  : 'bg-white text-dark hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StatusSelect
