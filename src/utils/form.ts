export const moderationStatusOptions = [
	{ value: 0, label: 'На модерации' },
	{ value: 1, label: 'Модерация отклонена' },
	{ value: 2, label: 'Модерация пройдена' },
];

export const moderationStatusTagColor: Record<number, string> = {
	0: 'gold',
	1: 'red',
	2: 'green',
};

export const publicationStatusOptions = [
	{ value: 0, label: 'Не опубликован' },
	{ value: 1, label: 'Опубликован' },
];

/** Имя файла с расширением jpg/png по data URL (Laravel mimes: jpg,jpeg,png не принимает .webp в имени при несовпадении содержимого). */
export function logoDataUrlToFileName(prefix: string, dataUrl: string): string {
	const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg'
	return `${prefix}_${Date.now()}.${ext}`
}

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