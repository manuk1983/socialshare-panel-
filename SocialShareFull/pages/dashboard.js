
import { getSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [postText, setPostText] = useState("")
  const [platforms, setPlatforms] = useState([])
  const [history, setHistory] = useState([])
  const [schedule, setSchedule] = useState("")

  useEffect(() => {
    getSession().then(sess => {
      if (!sess) {
        window.location.href = "/login"
      } else {
        setSession(sess)
        setLoading(false)
      }
    })
  }, [])

  const handlePlatformToggle = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handlePost = () => {
    const newPost = {
      text: postText,
      platforms,
      date: schedule || new Date().toLocaleString(),
      scheduled: !!schedule
    }
    setHistory((prev) => [newPost, ...prev])
    setPostText("")
    setPlatforms([])
    setSchedule("")
  }

  if (loading) return <p className="text-center mt-12 text-gray-600">Yükleniyor... / Loading...</p>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hoş geldin {session.user.email}!</h1>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
          Çıkış Yap / Logout
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">📢 Yeni Gönderi Oluştur / Create New Post</h2>
          <div className="space-y-2">
            <Label htmlFor="post">Gönderi Metni / Post Content</Label>
            <Input
              id="post"
              type="text"
              placeholder="Bugün harika bir gün..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Paylaşılacak Platformlar / Platforms</Label>
            <div className="flex gap-4 flex-wrap">
              {['Instagram', 'Facebook', 'Pinterest', 'TikTok'].map((platform) => (
                <Button
                  key={platform}
                  variant={platforms.includes(platform) ? "default" : "outline"}
                  onClick={() => handlePlatformToggle(platform)}
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Zamanla (isteğe bağlı) / Schedule (optional)</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handlePost}>Gönderiyi Paylaş / Share Post</Button>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold">📜 Paylaşım Geçmişi / Post History</h2>
            <ul className="space-y-2">
              {history.map((post, index) => (
                <li key={index} className="border-b pb-2">
                  <p><strong>📅 {post.date} {post.scheduled ? "(Zamanlanmış / Scheduled)" : ""}</strong></p>
                  <p>📝 {post.text}</p>
                  <p>📲 Platformlar: {post.platforms.join(", ")}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
