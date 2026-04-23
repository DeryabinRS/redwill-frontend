export const moderationStatusOptions = [
	{ value: 0, label: 'Новая' },
	{ value: 1, label: 'На модерации' },
	{ value: 2, label: 'Модерация пройдена' },
	{ value: 3, label: 'Модерация отклонена' },
];

export const moderationStatusTagColor: Record<number, string> = {
	0: 'default',
	1: 'gold',
	2: 'green',
	3: 'red',
};

export const publicationStatusOptions = [
	{ value: 0, label: 'Не опубликован' },
	{ value: 1, label: 'Опубликован' },
];

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