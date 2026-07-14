// "use client"

// import * as React from "react"
// import {
//   closestCenter,
//   DndContext,
//   KeyboardSensor,
//   MouseSensor,
//   TouchSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
//   type UniqueIdentifier,
// } from "@dnd-kit/core"
// import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable"
// import { CSS } from "@dnd-kit/utilities"
// import {
//   flexRender,
//   getCoreRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
//   type ColumnDef,
//   type ColumnFiltersState,
//   type Row,
//   type SortingState,
//   type VisibilityState,
// } from "@tanstack/react-table"
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
// import { toast } from "sonner"
// import { z } from "zod"

// import { useIsMobile } from "@/hooks/use-mobile"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@/components/ui/chart"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer"
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs"
// import { GripVerticalIcon, CircleCheckIcon, LoaderIcon, EllipsisVerticalIcon, Columns3Icon, ChevronDownIcon, PlusIcon, ChevronsLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsRightIcon, TrendingUpIcon } from "lucide-react"

// import Link from "next/link"

// export const schema = z.object({
//   id: z.string(),
//   name: z.string(),
//   email: z.string(),
//   department: z.string(),
//   is_active: z.boolean(),
//   joined_at: z.string(),
//   role: z.string(),
//   status: z.string(),
// })

// // Create a separate component for the drag handle
// function DragHandle({ id }: { id: string }) {
//   const { attributes, listeners } = useSortable({
//     id,
//   })
//   return (
//     <Button
//       {...attributes}
//       {...listeners}
//       variant="ghost"
//       size="icon"
//       className="size-7 text-muted-foreground hover:bg-transparent"
//     >
//       <GripVerticalIcon className="size-3 text-muted-foreground" />
//       <span className="sr-only">Drag to reorder</span>
//     </Button>
//   )
// }

// const columns: ColumnDef<z.infer<typeof schema>>[] = [
//   {
//     id: "drag",
//     header: () => null,
//     cell: ({ row }) => <DragHandle id={row.original.id} />,
//   },
//   {
//     id: "select",
//     header: ({ table }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={table.getIsAllPageRowsSelected()}
//           indeterminate={
//             table.getIsSomePageRowsSelected() &&
//             !table.getIsAllPageRowsSelected()
//           }
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       </div>
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "name",
//     header: "Name",
//     cell: ({ row }) => {
//       return <TableCellViewer item={row.original} />
//     },
//     enableHiding: false,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <div className="w-32">
//         <Badge variant="outline" className="px-1.5 text-muted-foreground">
//           {row.original.status}
//         </Badge>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <Badge variant="outline" className="px-1.5 text-muted-foreground">
//         {row.original.status === "present" ? (
//           <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
//         ) : (
//           <LoaderIcon
//           />
//         )}
//         {row.original.status}
//       </Badge>
//     ),
//   },
//   {
//     accessorKey: "is_active",
//     header: () => <div className="w-full text-right">Is active</div>,
//     cell: ({ row }) => (
//       <form
//         onSubmit={(e) => {
//           e.preventDefault()
//           toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
//             loading: `Saving ${row.original.header}`,
//             success: "Done",
//             error: "Error",
//           })
//         }}
//       >
//         <Label htmlFor={`${row.original.id}-target`} className="sr-only">
//           Target
//         </Label>
//         <Input
//           className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
//           defaultValue={row.original.target}
//           id={`${row.original.id}-target`}
//         />
//       </form>
//     ),
//   },
//   {
//     accessorKey: "limit",
//     header: () => <div className="w-full text-right">Limit</div>,
//     cell: ({ row }) => (
//       <form
//         onSubmit={(e) => {
//           e.preventDefault()
//           toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
//             loading: `Saving ${row.original.header}`,
//             success: "Done",
//             error: "Error",
//           })
//         }}
//       >
//         <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
//           Limit
//         </Label>
//         <Input
//           className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
//           defaultValue={row.original.limit}
//           id={`${row.original.id}-limit`}
//         />
//       </form>
//     ),
//   },
//   {
//     accessorKey: "reviewer",
//     header: "Reviewer",
//     cell: ({ row }) => {
//       const isAssigned = row.original.reviewer !== "Assign reviewer"
//       if (isAssigned) {
//         return row.original.reviewer
//       }
//       return (
//         <>
//           <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
//             Reviewer
//           </Label>
//           <Select
//             items={[
//               { label: "Eddie Lake", value: "Eddie Lake" },
//               { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
//             ]}
//           >
//             <SelectTrigger
//               className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
//               size="sm"
//               id={`${row.original.id}-reviewer`}
//             >
//               <SelectValue placeholder="Assign reviewer" />
//             </SelectTrigger>
//             <SelectContent align="end">
//               <SelectGroup>
//                 <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                 <SelectItem value="Jamik Tashpulatov">
//                   Jamik Tashpulatov
//                 </SelectItem>
//               </SelectGroup>
//             </SelectContent>
//           </Select>
//         </>
//       )
//     },
//   },
//   {
//     id: "actions",
//     cell: () => (
//       <DropdownMenu>
//         <DropdownMenuTrigger
//           render={
//             <Button
//               variant="ghost"
//               className="flex size-8 text-muted-foreground data-open:bg-muted"
//               size="icon"
//             />
//           }
//         >
//           <EllipsisVerticalIcon
//           />
//           <span className="sr-only">Open menu</span>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-32">
//           <DropdownMenuItem>Edit</DropdownMenuItem>
//           <DropdownMenuItem>Make a copy</DropdownMenuItem>
//           <DropdownMenuItem>Favorite</DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     ),
//   },
// ]

// function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
//   const { transform, transition, setNodeRef, isDragging } = useSortable({
//     id: row.original.id,
//   })
//   return (
//     <TableRow
//       data-state={row.getIsSelected() && "selected"}
//       data-dragging={isDragging}
//       ref={setNodeRef}
//       className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
//       style={{
//         transform: CSS.Transform.toString(transform),
//         transition: transition,
//       }}
//     >
//       {row.getVisibleCells().map((cell) => (
//         <TableCell key={cell.id}>
//           {flexRender(cell.column.columnDef.cell, cell.getContext())}
//         </TableCell>
//       ))}
//     </TableRow>
//   )
// }

// export function DataTable({
//   data: initialData,
// }: {
//   data: z.infer<typeof schema>[]
// }) {
//   const [data, setData] = React.useState(() => initialData)
//   const [rowSelection, setRowSelection] = React.useState({})
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({})
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   )
//   const [sorting, setSorting] = React.useState<SortingState>([])
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   })
//   const sortableId = React.useId()
//   const sensors = useSensors(
//     useSensor(MouseSensor, {}),
//     useSensor(TouchSensor, {}),
//     useSensor(KeyboardSensor, {})
//   )
//   const dataIds = React.useMemo<UniqueIdentifier[]>(
//     () => data?.map(({ id }) => id) || [],
//     [data]
//   )
//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       columnFilters,
//       pagination,
//     },
//     getRowId: (row) => row.id.toString(),
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//   })
//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event
//     if (active && over && active.id !== over.id) {
//       setData((data) => {
//         const oldIndex = dataIds.indexOf(active.id)
//         const newIndex = dataIds.indexOf(over.id)
//         return arrayMove(data, oldIndex, newIndex)
//       })
//     }
//   }
//   return (
//     <Tabs
//       defaultValue="outline"
//       className="w-full flex-col justify-start gap-6"
//     >
//       <div className="flex items-center justify-between px-4 lg:px-6">
//         <Label htmlFor="view-selector" className="sr-only">
//           View
//         </Label>
//         <Select
//           defaultValue="outline"
//           items={[
//             { label: "Outline", value: "outline" },
//             { label: "Past Performance", value: "past-performance" },
//             { label: "Key Personnel", value: "key-personnel" },
//             { label: "Focus Documents", value: "focus-documents" },
//           ]}
//         >
//           <SelectTrigger
//             className="flex w-fit @4xl/main:hidden"
//             size="sm"
//             id="view-selector"
//           >
//             <SelectValue placeholder="Select a view" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectGroup>
//               <SelectItem value="outline">Outline</SelectItem>
//               <SelectItem value="past-performance">Past Performance</SelectItem>
//               <SelectItem value="key-personnel">Key Personnel</SelectItem>
//               <SelectItem value="focus-documents">Focus Documents</SelectItem>
//             </SelectGroup>
//           </SelectContent>
//         </Select>
//         <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
//           <TabsTrigger value="outline">Outline</TabsTrigger>
//           <TabsTrigger value="past-performance">
//             Past Performance <Badge variant="secondary">3</Badge>
//           </TabsTrigger>
//           <TabsTrigger value="key-personnel">
//             Key Personnel <Badge variant="secondary">2</Badge>
//           </TabsTrigger>
//           <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
//         </TabsList>
//         <div className="flex items-center gap-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger
//               render={<Button variant="outline" size="sm" />}
//             >
//               <Columns3Icon data-icon="inline-start" />
//               Columns
//               <ChevronDownIcon data-icon="inline-end" />
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-32">
//               {table
//                 .getAllColumns()
//                 .filter(
//                   (column) =>
//                     typeof column.accessorFn !== "undefined" &&
//                     column.getCanHide()
//                 )
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   )
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Link href={"/mark-attendance"}>
//           <Button variant="outline" size="sm">
//             <PlusIcon
//             />
//             <span className="hidden lg:inline">Add Student</span>
//           </Button>
//           </Link>
//         </div>
//       </div>
//       <TabsContent
//         value="outline"
//         className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
//       >
//         <div className="overflow-hidden rounded-lg border">
//           <DndContext
//             collisionDetection={closestCenter}
//             modifiers={[restrictToVerticalAxis]}
//             onDragEnd={handleDragEnd}
//             sensors={sensors}
//             id={sortableId}
//           >
//             <Table>
//               <TableHeader className="sticky top-0 z-10 bg-muted">
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => {
//                       return (
//                         <TableHead key={header.id} colSpan={header.colSpan}>
//                           {header.isPlaceholder
//                             ? null
//                             : flexRender(
//                                 header.column.columnDef.header,
//                                 header.getContext()
//                               )}
//                         </TableHead>
//                       )
//                     })}
//                   </TableRow>
//                 ))}
//               </TableHeader>
//               <TableBody className="**:data-[slot=table-cell]:first:w-8">
//                 {table.getRowModel().rows?.length ? (
//                   <SortableContext
//                     items={dataIds}
//                     strategy={verticalListSortingStrategy}
//                   >
//                     {table.getRowModel().rows.map((row) => (
//                       <DraggableRow key={row.id} row={row} />
//                     ))}
//                   </SortableContext>
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.length}
//                       className="h-24 text-center"
//                     >
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </DndContext>
//         </div>
//         <div className="flex items-center justify-between px-4">
//           <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of{" "}
//             {table.getFilteredRowModel().rows.length} row(s) selected.
//           </div>
//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <Label htmlFor="rows-per-page" className="text-sm font-medium">
//                 Rows per page
//               </Label>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   table.setPageSize(Number(value))
//                 }}
//                 items={[10, 20, 30, 40, 50].map((pageSize) => ({
//                   label: `${pageSize}`,
//                   value: `${pageSize}`,
//                 }))}
//               >
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   <SelectGroup>
//                     {[10, 20, 30, 40, 50].map((pageSize) => (
//                       <SelectItem key={pageSize} value={`${pageSize}`}>
//                         {pageSize}
//                       </SelectItem>
//                     ))}
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of{" "}
//               {table.getPageCount()}
//             </div>
//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Go to first page</span>
//                 <ChevronsLeftIcon
//                 />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}
//               >
//                 <span className="sr-only">Go to previous page</span>
//                 <ChevronLeftIcon
//                 />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Go to next page</span>
//                 <ChevronRightIcon
//                 />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}
//               >
//                 <span className="sr-only">Go to last page</span>
//                 <ChevronsRightIcon
//                 />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
//       <TabsContent
//         value="past-performance"
//         className="flex flex-col px-4 lg:px-6"
//       >
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//       <TabsContent
//         value="focus-documents"
//         className="flex flex-col px-4 lg:px-6"
//       >
//         <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
//       </TabsContent>
//     </Tabs>
//   )
// }
// const chartData = [
//   {
//     month: "January",
//     desktop: 186,
//     mobile: 80,
//   },
//   {
//     month: "February",
//     desktop: 305,
//     mobile: 200,
//   },
//   {
//     month: "March",
//     desktop: 237,
//     mobile: 120,
//   },
//   {
//     month: "April",
//     desktop: 73,
//     mobile: 190,
//   },
//   {
//     month: "May",
//     desktop: 209,
//     mobile: 130,
//   },
//   {
//     month: "June",
//     desktop: 214,
//     mobile: 140,
//   },
// ]
// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--primary)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--primary)",
//   },
// } satisfies ChartConfig
// function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
//   const isMobile = useIsMobile()
//   return (
//     <Drawer swipeDirection={isMobile ? "down" : "right"}>
//       <DrawerTrigger
//         render={
//           <Button
//             variant="link"
//             className="w-fit px-0 text-left text-foreground"
//           />
//         }
//       >
//         {item.header}
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>{item.header}</DrawerTitle>
//           <DrawerDescription>
//             Showing total visitors for the last 6 months
//           </DrawerDescription>
//         </DrawerHeader>
//         <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//           {!isMobile && (
//             <>
//               <ChartContainer config={chartConfig}>
//                 <AreaChart
//                   accessibilityLayer
//                   data={chartData}
//                   margin={{
//                     left: 0,
//                     right: 10,
//                   }}
//                 >
//                   <CartesianGrid vertical={false} />
//                   <XAxis
//                     dataKey="month"
//                     tickLine={false}
//                     axisLine={false}
//                     tickMargin={8}
//                     tickFormatter={(value) => value.slice(0, 3)}
//                     hide
//                   />
//                   <ChartTooltip
//                     cursor={false}
//                     content={<ChartTooltipContent indicator="dot" />}
//                   />
//                   <Area
//                     dataKey="mobile"
//                     type="natural"
//                     fill="var(--color-mobile)"
//                     fillOpacity={0.6}
//                     stroke="var(--color-mobile)"
//                     stackId="a"
//                   />
//                   <Area
//                     dataKey="desktop"
//                     type="natural"
//                     fill="var(--color-desktop)"
//                     fillOpacity={0.4}
//                     stroke="var(--color-desktop)"
//                     stackId="a"
//                   />
//                 </AreaChart>
//               </ChartContainer>
//               <Separator />
//               <div className="grid gap-2">
//                 <div className="flex gap-2 leading-none font-medium">
//                   Trending up by 5.2% this month{" "}
//                   <TrendingUpIcon className="size-4" />
//                 </div>
//                 <div className="text-muted-foreground">
//                   Showing total visitors for the last 6 months. This is just
//                   some random text to test the layout. It spans multiple lines
//                   and should wrap around.
//                 </div>
//               </div>
//               <Separator />
//             </>
//           )}
//           <form className="flex flex-col gap-4">
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="header">Header</Label>
//               <Input id="header" defaultValue={item.header} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="type">Type</Label>
//                 <Select
//                   defaultValue={item.type}
//                   items={[
//                     { label: "Table of Contents", value: "Table of Contents" },
//                     { label: "Executive Summary", value: "Executive Summary" },
//                     {
//                       label: "Technical Approach",
//                       value: "Technical Approach",
//                     },
//                     { label: "Design", value: "Design" },
//                     { label: "Capabilities", value: "Capabilities" },
//                     { label: "Focus Documents", value: "Focus Documents" },
//                     { label: "Narrative", value: "Narrative" },
//                     { label: "Cover Page", value: "Cover Page" },
//                   ]}
//                 >
//                   <SelectTrigger id="type" className="w-full">
//                     <SelectValue placeholder="Select a type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value="Table of Contents">
//                         Table of Contents
//                       </SelectItem>
//                       <SelectItem value="Executive Summary">
//                         Executive Summary
//                       </SelectItem>
//                       <SelectItem value="Technical Approach">
//                         Technical Approach
//                       </SelectItem>
//                       <SelectItem value="Design">Design</SelectItem>
//                       <SelectItem value="Capabilities">Capabilities</SelectItem>
//                       <SelectItem value="Focus Documents">
//                         Focus Documents
//                       </SelectItem>
//                       <SelectItem value="Narrative">Narrative</SelectItem>
//                       <SelectItem value="Cover Page">Cover Page</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   defaultValue={item.status}
//                   items={[
//                     { label: "Done", value: "Done" },
//                     { label: "In Progress", value: "In Progress" },
//                     { label: "Not Started", value: "Not Started" },
//                   ]}
//                 >
//                   <SelectTrigger id="status" className="w-full">
//                     <SelectValue placeholder="Select a status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value="Done">Done</SelectItem>
//                       <SelectItem value="In Progress">In Progress</SelectItem>
//                       <SelectItem value="Not Started">Not Started</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="target">Target</Label>
//                 <Input id="target" defaultValue={item.target} />
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="limit">Limit</Label>
//                 <Input id="limit" defaultValue={item.limit} />
//               </div>
//             </div>
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="reviewer">Reviewer</Label>
//               <Select
//                 defaultValue={item.reviewer}
//                 items={[
//                   { label: "Eddie Lake", value: "Eddie Lake" },
//                   { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
//                   { label: "Emily Whalen", value: "Emily Whalen" },
//                 ]}
//               >
//                 <SelectTrigger id="reviewer" className="w-full">
//                   <SelectValue placeholder="Select a reviewer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                     <SelectItem value="Jamik Tashpulatov">
//                       Jamik Tashpulatov
//                     </SelectItem>
//                     <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             </div>
//           </form>
//         </div>
//         <DrawerFooter>
//           <Button>Submit</Button>
//           <DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   )
// }



"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import dayjs from "dayjs"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  GripVerticalIcon,
  CircleCheckIcon,
  CircleIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  UserIcon,
  MailIcon,
  BuildingIcon,
  CalendarIcon,
  ShieldIcon,
} from "lucide-react"

import Link from "next/link"

// Updated schema to match the JSON structure
export const schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  department: z.string(),
  is_active: z.boolean(),
  joined_at: z.string(),
  role: z.string(),
  status: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },

  // {
  //   accessorKey: `department`,
  //   header: "Department",
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-2 text-muted-foreground">
  //       <BuildingIcon className="size-3.5" />
  //       <span className="truncate max-w-[200px]">{row.original.department.split(" ")[0]}</span>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <MailIcon className="size-3.5" />
        <span className="truncate max-w-[200px]">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const isPresent = status === "present"
      const isAbsent = status === "absent"
      const isLeave = status === "leave"
      const isLate = status === "late"

      const className = isPresent ? (
        "bg-green-400/30 text-green-500"
      ) : isAbsent ? (
        "bg-red-400/30 text-red-500"
      ) : isLate ? (
        "bg-orange-400/30 text-orange-500"
      ) : "bg-yellow-400/30 text-yellow-500"

      return (
        <Badge
          className={className}>
          <span className="capitalize">{status}</span>
        </Badge>
      )
    },
  },
  // {
  //   accessorKey: "is_active",
  //   header: "Active",
  //   cell: ({ row }) => {
  //     const isActive = row.original.is_active

  //     return (
  //       <div className="flex items-center gap-2">
  //           <Badge variant="secondary" className={`${isActive ? "bg-green-400/30 text-green-500" : "bg-red-500/30 text-red-500"}`}>
  //          {isActive ? "Active" : "Inactive"}
  //       </Badge>
  //       </div>
  //     )
  //   },
  // },

  {
    accessorKey: "joined_at",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="size-3.5" />
          <span>{dayjs(row.original.joined_at).format("MMM D, YYYY")}</span>
        </div>
      )
    },
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {

      const isAdmin = row.original.role === "admin"
      return (
        <div className="flex items-center gap-2">
          {/* <ShieldIcon className="size-3.5 text-muted-foreground" /> */}
          <Badge variant="secondary" className={`${isAdmin ? "bg-blue-400/30 text-blue-500" : "bg-green-500/30 text-green-500"}`}>
            {row.original.role.toUpperCase()}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex size-8 text-muted-foreground data-[state=open]:bg-muted">
          {/* <Button
            variant="ghost"
           
            size="icon"
          > */}
          <EllipsisVerticalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
          {/* </Button> */}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => {
            toast.info(`Editing ${row.original.name}`)
          }}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            toast.info(`Viewing details for ${row.original.name}`)
          }}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            toast.success(`Email sent to ${row.original.email}`)
          }}>
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              toast.error(`${row.original.name} has been removed`)
            }}
          >
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="all-users"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select
          defaultValue="all-users"
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all-users">All Users</SelectItem>
              <SelectItem value="active-users">Active Users</SelectItem>
              <SelectItem value="inactive-users">Inactive Users</SelectItem>
              <SelectItem value="by-department">By Department</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all-users">
            All Users <Badge variant="secondary" className="ml-2">{data.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active-users">
            Active <Badge variant="secondary" className="ml-2">{data.filter(d => d.is_active).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive-users">
            Inactive <Badge variant="secondary" className="ml-2">{data.filter(d => !d.is_active).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="by-department">By Department</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {/* <Button variant="outline" size={"sm"}> */}
              <Columns3Icon />
              <span className="hidden lg:inline ml-2">Columns</span>
              <ChevronDownIcon />
              {/* </Button> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" size="sm" asChild>
            <Link href={"/add-user"}>
              <PlusIcon />
              <span className="hidden lg:inline ml-2">Add User</span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsContent
        value="all-users"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} user(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="active-users"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          Active Users View (Filtered)
        </div>
      </TabsContent>
      <TabsContent value="inactive-users" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          Inactive Users View (Filtered)
        </div>
      </TabsContent>
      <TabsContent
        value="by-department"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          Users by Department View
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  const initials = item.name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <Drawer>
      <DrawerTrigger>
        <Button
          variant="link"
          className="w-fit px-0 text-left text-foreground hover:no-underline"
        >
          <div className="flex items-center gap-3">
            {/* <Avatar className="size-8">
              <AvatarImage src={`https://avatar.vercel.sh/${item.name}.png`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar> */}
            <span>{item.name}</span>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={`https://avatar.vercel.sh/${item.name}.png`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {item.name}
          </DrawerTitle>
          <DrawerDescription>
            User Details and Settings
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge
                  variant={item.status === "present" ? "default" : "destructive"}
                  className="ml-2 capitalize"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{item.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BuildingIcon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Department</Label>
                <p className="font-medium">{item.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Badge variant="secondary" className="ml-2 capitalize">
                  {item.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Joined</Label>
                <p className="font-medium">
                  {dayjs(item.joined_at).format("MMMM D, YYYY")}
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={item.name} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={item.email} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="department">Department</Label>
              <Input id="department" defaultValue={item.department} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={item.role}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                defaultChecked={item.is_active}
                id="is_active"
              />
              <Label htmlFor="is_active">Active User</Label>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button
            onClick={() => {
              toast.success("User updated successfully")
            }}
          >
            Save Changes
          </Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}