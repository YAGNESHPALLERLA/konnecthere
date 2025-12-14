// Simple toast notification utility
export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-md ${
    type === "success"
      ? "bg-green-50 text-green-800 border border-green-200"
      : type === "error"
      ? "bg-red-50 text-red-800 border border-red-200"
      : "bg-blue-50 text-blue-800 border border-blue-200"
  }`
  toast.textContent = message

  // Add to DOM
  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0"
    toast.style.transition = "opacity 0.3s"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

