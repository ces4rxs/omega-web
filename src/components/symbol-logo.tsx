"use client"

import { useState } from "react"

interface SymbolLogoProps {
  symbol: string
  size?: "sm" | "md" | "lg"
  showName?: boolean
  className?: string
}

// Mapping of common stock symbols to their company domains
const symbolToDomain: { [key: string]: string } = {
  AAPL: "apple.com",
  GOOGL: "google.com",
  GOOG: "google.com",
  MSFT: "microsoft.com",
  AMZN: "amazon.com",
  TSLA: "tesla.com",
  META: "meta.com",
  NVDA: "nvidia.com",
  AMD: "amd.com",
  NFLX: "netflix.com",
  INTC: "intel.com",
  BABA: "alibaba.com",
  DIS: "disney.com",
  PYPL: "paypal.com",
  ADBE: "adobe.com",
  CSCO: "cisco.com",
  ORCL: "oracle.com",
  IBM: "ibm.com",
  UBER: "uber.com",
  SPOT: "spotify.com",
  SHOP: "shopify.com",
  SQ: "squareup.com",
  COIN: "coinbase.com",
  HOOD: "robinhood.com",
  PLTR: "palantir.com",
  SNOW: "snowflake.com",
  ZM: "zoom.us",
  RBLX: "roblox.com",
  U: "unity.com",
  NET: "cloudflare.com",
  DDOG: "datadoghq.com",
  CRWD: "crowdstrike.com",
  MDB: "mongodb.com",
  TEAM: "atlassian.com",
  NOW: "servicenow.com",
  CRM: "salesforce.com",
  WORK: "slack.com",
  TWLO: "twilio.com",
  OKTA: "okta.com",
  ZS: "zscaler.com",
  PANW: "paloaltonetworks.com",
  FTNT: "fortinet.com",
  AVGO: "broadcom.com",
  QCOM: "qualcomm.com",
  TXN: "ti.com",
  MU: "micron.com",
  AMAT: "appliedmaterials.com",
  LRCX: "lamresearch.com",
  KLAC: "kla.com",
  SNPS: "synopsys.com",
  CDNS: "cadence.com",
  MRVL: "marvell.com",
  ASML: "asml.com",
  TSM: "tsmc.com",
  V: "visa.com",
  MA: "mastercard.com",
  JPM: "jpmorganchase.com",
  BAC: "bankofamerica.com",
  WFC: "wellsfargo.com",
  GS: "goldmansachs.com",
  MS: "morganstanley.com",
  BLK: "blackrock.com",
  SCHW: "schwab.com",
  AXP: "americanexpress.com",
  C: "citigroup.com",
  PFE: "pfizer.com",
  JNJ: "jnj.com",
  UNH: "unitedhealthgroup.com",
  ABBV: "abbvie.com",
  TMO: "thermofisher.com",
  MRK: "merck.com",
  LLY: "lilly.com",
  GILD: "gilead.com",
  AMGN: "amgen.com",
  BMY: "bms.com",
  CVS: "cvshealth.com",
  WBA: "walgreensbootsalliance.com",
  NKE: "nike.com",
  SBUX: "starbucks.com",
  MCD: "mcdonalds.com",
  KO: "coca-cola.com",
  PEP: "pepsico.com",
  WMT: "walmart.com",
  HD: "homedepot.com",
  TGT: "target.com",
  COST: "costco.com",
  LOW: "lowes.com",
  BA: "boeing.com",
  CAT: "caterpillar.com",
  GE: "ge.com",
  MMM: "3m.com",
  HON: "honeywell.com",
  UPS: "ups.com",
  FDX: "fedex.com",
  LMT: "lockheedmartin.com",
  RTX: "rtx.com",
  XOM: "exxonmobil.com",
  CVX: "chevron.com",
  COP: "conocophillips.com",
  SLB: "slb.com",
  EOG: "eogresources.com",
  PXD: "pxd.com",
}

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "w-6 h-6 text-xs"
    case "md":
      return "w-8 h-8 text-sm"
    case "lg":
      return "w-12 h-12 text-base"
    default:
      return "w-8 h-8 text-sm"
  }
}

export function SymbolLogo({ symbol, size = "md", showName = false, className = "" }: SymbolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const upperSymbol = symbol.toUpperCase()

  // Best logo sources that work directly (return images, not JSON)
  // Priority order:
  // 1. Financialmodelingprep - Free, works great for stocks, no auth needed
  // 2. Logo.dev - Good fallback for general companies
  // 3. Gradient badge with initials (always works)

  const logoSources = [
    `https://financialmodelingprep.com/image-stock/${upperSymbol}.png`,
    `https://img.logo.dev/ticker/${upperSymbol}?token=pk_X-1ZBbAQTumJRM7-5dOOWg`,
  ]

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)

  const handleImageError = () => {
    if (currentSourceIndex < logoSources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1)
    } else {
      setImgError(true)
    }
  }

  const sizeClasses = getSizeClasses(size)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeClasses} rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0`}>
          <img
            src={logoSources[currentSourceIndex]}
            alt={symbol}
            className="w-full h-full object-contain p-0.5"
            onError={handleImageError}
          />
        </div>
      ) : (
        // Fallback to initials with gradient
        <div className={`${sizeClasses} rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white flex-shrink-0`}>
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      )}
      {showName && (
        <span className="font-semibold text-white">{symbol}</span>
      )}
    </div>
  )
}
