"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Gift } from "lucide-react"
import { RewardFormDialog } from "./reward-form-dialog"

export interface Reward {
  id: string
  name: string
  description: string
  category: "beverages" | "food" | "discounts" | "merchandise"
  pointsRequired: number
  status: "active" | "inactive"
  redemptionCount: number
  createdAt: string
  updatedAt: string
}

const mockRewards: Reward[] = [
  {
    id: "1",
    name: "Free Coffee",
    description: "Any regular coffee drink",
    category: "beverages",
    pointsRequired: 500,
    status: "active",
    redemptionCount: 234,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-20",
  },
  {
    id: "2",
    name: "Free Pastry",
    description: "Any pastry from our selection",
    category: "food",
    pointsRequired: 300,
    status: "active",
    redemptionCount: 156,
    createdAt: "2024-01-16",
    updatedAt: "2024-02-18",
  },
  {
    id: "3",
    name: "10% Discount",
    description: "10% off on next purchase",
    category: "discounts",
    pointsRequired: 200,
    status: "active",
    redemptionCount: 89,
    createdAt: "2024-01-17",
    updatedAt: "2024-02-25",
  },
  {
    id: "4",
    name: "Free Sandwich",
    description: "Any sandwich from our menu",
    category: "food",
    pointsRequired: 800,
    status: "active",
    redemptionCount: 67,
    createdAt: "2024-01-18",
    updatedAt: "2024-02-22",
  },
  {
    id: "5",
    name: "Coffee Mug",
    description: "Himalayan Java branded coffee mug",
    category: "merchandise",
    pointsRequired: 1000,
    status: "inactive",
    redemptionCount: 23,
    createdAt: "2024-01-19",
    updatedAt: "2024-02-10",
  },
]

export function RewardsCatalogTable() {
  const [rewards, setRewards] = useState<Reward[]>(mockRewards)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (rewardId: string) => {
    setRewards(rewards.filter((reward) => reward.id !== rewardId))
  }

  const handleSaveReward = (rewardData: Partial<Reward>) => {
    if (selectedReward) {
      // Edit existing reward
      setRewards(
        rewards.map((reward) =>
          reward.id === selectedReward.id
            ? { ...reward, ...rewardData, updatedAt: new Date().toISOString().split("T")[0] }
            : reward,
        ),
      )
    } else {
      // Add new reward
      const newReward: Reward = {
        id: Date.now().toString(),
        name: rewardData.name || "",
        description: rewardData.description || "",
        category: rewardData.category || "beverages",
        pointsRequired: rewardData.pointsRequired || 0,
        status: rewardData.status || "active",
        redemptionCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setRewards([...rewards, newReward])
    }
    setSelectedReward(null)
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "beverages":
        return "bg-blue-100 text-blue-800"
      case "food":
        return "bg-orange-100 text-orange-800"
      case "discounts":
        return "bg-purple-100 text-purple-800"
      case "merchandise":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reward</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Points Required</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow key={reward.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-muted-foreground max-w-[200px] truncate">{reward.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(reward.category)}>
                    {reward.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{reward.pointsRequired}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(reward.status)}>
                    {reward.status}
                  </Badge>
                </TableCell>
                <TableCell>{reward.redemptionCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(reward.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(reward)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Reward
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(reward.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Reward
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RewardFormDialog
        reward={selectedReward}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveReward}
      />

      <RewardFormDialog
        reward={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveReward}
      />

      {/* Export the add dialog trigger */}
      <Button onClick={() => setIsAddDialogOpen(true)} className="hidden" id="add-reward-trigger">
        Add Reward
      </Button>
    </>
  )
}
