export const LongTextDisplay = ({ textToDisplay }: { textToDisplay: string }) => {
    return (
        <div className="absolute bottom-4 right-4 text-sm text-gray-500 whitespace-pre-wrap break-words max-w-[500px] leading-relaxed p-4 rounded-lg bg-white/80 shadow-sm">
            {textToDisplay}
        </div>
    )
}