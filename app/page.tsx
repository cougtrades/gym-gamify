import workoutTemplates from '@/data/workout-templates.json'
import { HomeClient } from './home-client'

// Home page is static — templates come from JSON, user data loads client-side
// Templates render instantly, stats load in background
export default function Home() {
  return <HomeClient templates={workoutTemplates.templates} />
}
