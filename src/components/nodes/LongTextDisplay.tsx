export const LongTextDisplay = ({ textToDisplay }: { textToDisplay: string }) => {
    return (
        <div className="text-sm text-gray-500 whitespace-pre-wrap break-words max-w-[500px] leading-relaxed p-4 rounded-lg bg-white/50 shadow-sm">
            {textToDisplay}
        </div>
    )
}