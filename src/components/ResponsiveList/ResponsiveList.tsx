import { Empty, Grid, Spin, Table, theme } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { ReactNode } from 'react'

type PaginationProps = {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showTotal?: (total: number) => string
}

type ResponsiveListProps<T extends { id: number }> = {
  data: T[]
  loading: boolean
  columns: ColumnsType<any>
  pagination: PaginationProps
  onChange?: (pagination: TablePaginationConfig) => void
  renderItem: (record: T) => ReactNode
}

export function ResponsiveList<T extends { id: number }>({
  data,
  loading,
  columns,
  pagination,
  onChange,
  renderItem,
}: ResponsiveListProps<T>) {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.lg

  if (isMobile) {
    return (
      <Spin spinning={loading}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((record) => (
            <div key={record.id}>{renderItem(record)}</div>
          ))}
          {!loading && data.length === 0 ? <Empty description="Нет данных" /> : null}
        </div>
      </Spin>
    )
  }

  return (
    <Table
      size="small"
      rowKey="id"
      loading={loading}
      dataSource={data}
      columns={columns}
      onChange={onChange}
      pagination={pagination}
    />
  )
}

type ListBlockProps = {
  title?: ReactNode
  extra?: ReactNode
  children?: ReactNode
  actions?: ReactNode
}

export function ListBlock({ title, extra, children, actions }: ListBlockProps) {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: 12,
        background: token.colorBgContainer,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        {extra}
      </div>
      {children ? <div style={{ marginTop: 8 }}>{children}</div> : null}
      {actions ? (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>{actions}</div>
      ) : null}
    </div>
  )
}
