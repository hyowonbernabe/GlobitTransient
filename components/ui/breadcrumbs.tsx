import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
            <Link
                href="/"
                className="flex items-center hover:text-emerald-600 transition-colors p-1 rounded-md hover:bg-emerald-50"
            >
                <Home className="w-4 h-4" />
                <span className="sr-only">Home</span>
            </Link>

            {items.map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                    {index === items.length - 1 ? (
                        <span className="font-medium text-emerald-900 line-clamp-1 max-w-[150px] md:max-w-none">
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            href={item.href}
                            className="hover:text-emerald-600 transition-colors line-clamp-1 max-w-[100px] md:max-w-none"
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
