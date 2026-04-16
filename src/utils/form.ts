export const base64ToFile = async (base64: string, fileName: string): Promise<File | null> => {
	try {
		const response = await fetch(base64)
		const blob = await response.blob()
		return new File([blob], fileName, { type: blob.type })
	} catch (error) {
		console.error('Failed to convert base64 to file:', error)
		return null
	}
}

export const sanitizeInput = (value: string): string => {
	if (typeof value !== 'string') return value
	return value
		.replace(/<(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/<(script|iframe|object|embed|style)[^>]*\/?>/gi, '')
		.replace(/\son\w+="[^"]*"/gi, '')
		.replace(/\son\w+='[^']*'/gi, '')
		.replace(/(href|src)\s*=\s*["']?javascript:[^"'\s>]*/gi, '$1=""')
		.trim()
}