import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Props {
  name: string
  image?: string
}

export default function UserItem({ name, image }: Props) {
  return (
    <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-muted">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} />
        <AvatarFallback>
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <span className="text-sm font-medium">{name}</span>
    </button>
  )
}