import workoutTemplates from '@/data/workout-templates.json'
import { HomeClient } from './home-client'

export default function Home() {
  return <HomeClient templates={workoutTemplates.templates} />
}