import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sidebarVariants = cva(
  "fixed inset-y-0 z-50 flex flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      position: {
        left: "left-0 border-r",
        right: "right-0 border-l",
      },
      size: {
        sm: "w-64",
        md: "w-80",
        lg: "w-96",
        full: "w-full",
      },
      open: {
        true: "translate-x-0",
        false: "",
      },
    },
    defaultVariants: {
      position: "left",
      size: "sm",
      open: false,
    },
    compoundVariants: [
      {
        position: "left",
        open: false,
        class: "-translate-x-full",
      },
      {
        position: "right",
        open: false,
        class: "translate-x-full",
      },
    ],
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  overlay?: boolean
  onClose?: () => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, position, size, open, overlay = true, onClose, children, ...props }, ref) => {
    // 处理点击遮罩层关闭侧边栏
    const handleOverlayClick = React.useCallback(() => {
      if (onClose) {
        onClose()
      }
    }, [onClose])

    // 处理ESC键关闭侧边栏
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (open && e.key === "Escape" && onClose) {
          onClose()
        }
      }

      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }, [open, onClose])

    return (
      <>
        {/* 遮罩层 */}
        {overlay && open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* 侧边栏 */}
        <div
          ref={ref}
          className={cn(sidebarVariants({ position, size, open }), className)}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b px-4 py-3 flex items-center justify-between", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
SidebarTitle.displayName = "SidebarTitle"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto p-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

export { Sidebar, SidebarHeader, SidebarTitle, SidebarContent, SidebarFooter }