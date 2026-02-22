import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import CartDrawer from '@/components/shared/CartDrawer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  )
}
