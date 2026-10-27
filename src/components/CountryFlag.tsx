import * as Flags from 'country-flag-icons/react/3x2'
import type { ComponentType, CSSProperties, ReactNode } from 'react'

type FlagProps = {
  className?: string
  style?: CSSProperties
}

type CountryFlagProps = {
  code?: string | null
  className?: string
  style?: CSSProperties
  fallback?: ReactNode
}

function CountryFlag({ code, className, style, fallback = null }: CountryFlagProps) {
  if (!code) return <>{fallback}</>

  const Flag = (Flags as unknown as Record<string, ComponentType<FlagProps> | undefined>)[code.toUpperCase()]

  if (!Flag) return <>{fallback}</>

  return <Flag className={className} style={style} />
}

export default CountryFlag
