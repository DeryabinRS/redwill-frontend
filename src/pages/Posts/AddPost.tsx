import { useState } from 'react';
import { 
	App as AntdApp, Form, Input, DatePicker, TimePicker, 
	Button, Typography, Card, Space, Row, Col, Select,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'
import ImageCropper from '../../components/ImageCropper';
import { useCreatePostMutation } from '../../features/post/postSlice';
import { useGetDashboardMotoclubListQuery, type Motoclub } from '@features/motoclub/motoclubSlice'
import MapPicker from '../../components/YandexMapV3/MapPicker';
import { base64ToFile, sanitizeInput } from '../../utils/form';

const { Title } = Typography;

type Orientation = 'portrait' | 'landscape';

interface FormValues {
	title: string
	post_category_id: number
	location?: string
	address?: string
	motoclub_ids?: number[]
	image: File
	link?: string
	date_start: dayjs.Dayjs
	date_end?: dayjs.Dayjs
	time_start?: dayjs.Dayjs
	time_end?: dayjs.Dayjs
}

function AddPost() {
	const [form] = Form.useForm()
	const { message } = AntdApp.useApp()
	const navigate = useNavigate()
	const [orientation, setOrientation] = useState<Orientation>('portrait')
	const [image, setImage] = useState('')
	
	const [ createPost, { isLoading: isSubmitting }] = useCreatePostMutation()
	const { data: motoclubsData, isLoading: isLoadingMotoclubs } = useGetDashboardMotoclubListQuery({
		pagination: { page: 1, per_page: 100 },
	})
	const motoclubOptions = (motoclubsData?.data || []).map((motoclub: Motoclub) => ({
		value: motoclub.id,
		label: `${motoclub.name} ${motoclub.address ? `(${motoclub.address})` : ''}`,
	}))

	const handleSubmit = async (values: FormValues) => {
		try {
			// 🔥 Создаём FormData для multipart/form-data
			const formData = new FormData()
			
			// Текстовые поля с санитизацией
			formData.append('title', sanitizeInput(values.title))
			formData.append('post_category_id', '2')
			if (values.location) formData.append('location', sanitizeInput(values.location))
			if (values.address) formData.append('address', sanitizeInput(values.address))
			if (values.link) formData.append('link', sanitizeInput(values.link))
			values.motoclub_ids?.forEach((id) => {
				formData.append('motoclub_ids[]', String(id))
			})
			
			// Даты и время
			formData.append('date_start', values.date_start.format('YYYY-MM-DD'))
			if (values.date_end) formData.append('date_end', values.date_end.format('YYYY-MM-DD'))
			if (values.time_start) formData.append('time_start', values.time_start.format('HH:mm'))
			if (values.time_end) formData.append('time_end', values.time_end.format('HH:mm'))
			
			// 🖼️ Конвертация base64 → File
			if (image && image.startsWith('data:image')) {
				const file = await base64ToFile(image, `post_${Date.now()}.jpg`)
				if (file) {
					formData.append('image', file)
				}
			}

			// 📡 Отправка через RTK Query (formData: true в postSlice.ts обработает это)
			// const created = await createPost(formData).unwrap()
			await createPost(formData).unwrap()
			message.success('Пост успешно создан')
			navigate('/profile')
		} catch (error) {
			console.error('Create post error:', error)
			message.error('Ошибка при создании поста')
		}
	}

	const noScriptPattern = /^(?!.*<script|javascript:|on\w+=).*$/i;

	return (
		<div className="container">
			<Title level={2}>Создание поста</Title>
			<Card>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={{
						date_start: dayjs(),
					}}
				>
					<Row gutter={16}>
						<Col xs={24} md={8}>
							<Form.Item
								name="image"
								label="Изображение (JPG, PNG)"
								rules={[
									{ required: true, message: 'Выберите изображение' },
								]}
							>
								<ImageCropper
									value={image}
									onChange={setImage}
									orientation={orientation}
									onOrientationChange={setOrientation}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} md={16}>
							<Form.Item
								name="title"
								label="Заголовок"
								rules={[
									{ required: true, message: 'Введите заголовок' },
									{ max: 255, message: 'Максимум 255 символов' },
									{ pattern: noScriptPattern, message: 'Недопустимые символы' },
								]}
							>
							<Input placeholder="Введите заголовок" />
							</Form.Item>
							<Form.Item
								name="link"
								label="Ссылка"
								rules={[
									{ type: 'url', message: 'Введите корректный URL' },
									{ pattern: noScriptPattern, message: 'Недопустимые символы' },
								]}
							>
								<Input placeholder="https://example.com" />
							</Form.Item>
							<Form.Item label="Организаторы (Мотоклубы):" name="motoclub_ids">
								<Select
									mode="multiple"
									allowClear
									showSearch
									optionFilterProp="label"
									loading={isLoadingMotoclubs}
									options={motoclubOptions}
									placeholder="Выберите мотоклубы"
								/>
							</Form.Item>
							<MapPicker 
								onChangeLocation={(loc: string) => {
									form.setFieldValue('location', loc); // Синхронизируем с формой
								}}
								onChangeAddress={(addr: string) => {
									form.setFieldValue('address', addr);
								}}
							/>
							<Form.Item
								name="location"
								label="Координаты"
								style={{ marginTop: 8, marginBottom: 8 }}
							>
								<Input readOnly placeholder="Кликните по карте, чтобы получить координаты..." />
							</Form.Item>
							<Form.Item
								name="address"
								label="Адрес"
							>
								<Input readOnly placeholder="Кликните по карте, чтобы определить адрес..." />
							</Form.Item>
							<Space size="large" style={{ width: '100%' }}>
								<Form.Item
									name="date_start"
									label="Дата начала"
									rules={[{ required: true, message: 'Выберите дату начала' }]}
								>
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name="time_start"
									label="Время начала"
								>
									<TimePicker format="HH:mm" style={{ width: '100%' }} />
								</Form.Item>
							</Space>
							<Space size="large" style={{ width: '100%' }}>
								<Form.Item
									name="date_end"
									label="Дата окончания"
								>
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name="time_end"
									label="Время окончания"
								>
									<TimePicker format="HH:mm" style={{ width: '100%' }} />
								</Form.Item>
							</Space>
							<Form.Item>
								<Space>
									<Button type="primary" htmlType="submit" loading={isSubmitting}>
									Создать пост
									</Button>
									<Button onClick={() => navigate(-1)}>
									Отмена
									</Button>
								</Space>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card>
		</div>
	)
}

export default AddPost
