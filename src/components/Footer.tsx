import Link from 'next/link'
import BaseContainer from '@/components/BaseContainer'
import { FaInstagram, FaPhone } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t py-10 mt-20">
      <BaseContainer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center">
        <p className="text-sm text-muted-foreground">© 2024 Best Electronics</p>
        <div className="flex justify-center gap-6 text-muted-foreground">
          <Link href="https://instagram.com/best___electronics" className="hover:text-foreground" target="_blank">
            <FaInstagram className="inline-block mr-2" />Instagram
          </Link>
          <Link href="tel:+996501313114" className="hover:text-foreground">
            <FaPhone className="inline-block mr-2" />+996 501‑31‑31‑14
          </Link>
        </div>
      </BaseContainer>
    </footer>
  )
}
