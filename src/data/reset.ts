import { resetManagement } from "@/data/managementStore"
import { resetNotifications } from "@/data/notificationStore"
import { resetReview } from "@/data/reviewStore"

/**
 * Reset every shared demo store back to its seed so the presentation can be
 * re-run from a clean state (used from the Student and Supervisor profiles).
 */
export function resetDemoData() {
  resetManagement()
  resetReview()
  resetNotifications()
}