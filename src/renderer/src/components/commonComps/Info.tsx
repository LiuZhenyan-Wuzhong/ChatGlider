import { AllHTMLAttributes, forwardRef } from 'react'

interface InfoProps extends AllHTMLAttributes<HTMLDivElement> {
  ref: React.LegacyRef<HTMLButtonElement>
}

export default forwardRef(function Info({ className }: InfoProps): JSX.Element {
  return (
    <div className="w-5 h-5 rounded-full border flex items-center justify-center">
      <span className="italic text-sm">i</span>
    </div>
  )
})
