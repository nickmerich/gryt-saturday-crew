// Owner-supplied partner logos. Used when no logo was uploaded through the partner desk.
import montgomery from '@/assets/partners/montgomery-parks.png.asset.json'
import smartwater from '@/assets/partners/smartwater.png.asset.json'
import ucan from '@/assets/partners/ucan.jpg.asset.json'
import montour from '@/assets/partners/montour-trail.webp.asset.json'
import p3r from '@/assets/partners/p3r-move.png.asset.json'
import uncommon from '@/assets/partners/uncommon.jpg.asset.json'

const byName: Record<string, string> = {
  'montgomery parks': montgomery.url,
  smartwater: smartwater.url,
  ucan: ucan.url,
  'montour trail': montour.url,
  'p3r move': p3r.url,
  'uncommon training': uncommon.url,
}
export const partnerLogo = (p: { name: string; logo: string }) => p.logo || byName[p.name.trim().toLowerCase()] || ''
