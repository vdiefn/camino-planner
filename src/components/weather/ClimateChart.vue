<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Chart,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from 'chart.js'
import type { MonthlyClimateStats } from '@/types/climate'

Chart.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
)

interface Props {
  monthly: MonthlyClimateStats[]
  selectedMonth: number
  stationLabel: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'selectMonth', month: number): void
}>()

const { t, locale } = useI18n()
const isEn = computed(() => locale.value.startsWith('en'))
const canvasRef = ref<HTMLCanvasElement | null>(null)
const chartInstance = shallowRef<Chart | null>(null)
const canvasFailed = ref(false)
const hiddenDatasets = ref<Record<number, boolean>>({})

const legendItems = computed(() => [
  { index: 0, label: t('weather.chart.avgHigh'), dotClass: 'bg-red-500' },
  { index: 1, label: t('weather.chart.avgLow'), dotClass: 'bg-blue-500' },
  { index: 2, label: t('weather.chart.rainyDays'), dotClass: 'bg-slate-300 border border-slate-400/70' },
])

function toggleDataset(index: number) {
  if (!chartInstance.value) return
  const nextHidden = !hiddenDatasets.value[index]
  hiddenDatasets.value = { ...hiddenDatasets.value, [index]: nextHidden }
  chartInstance.value.setDatasetVisibility(index, !nextHidden)
  chartInstance.value.update()
}

const monthLabels = computed(() =>
  isEn.value
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
)

function buildChartData() {
  const highTemps = props.monthly.map((m) => m.avgHighC)
  const lowTemps = props.monthly.map((m) => m.avgLowC)
  const rainyDays = props.monthly.map((m) => m.rainyDays)
  const barColors = props.monthly.map((m) =>
    m.month === props.selectedMonth ? 'rgba(14, 165, 233, 0.78)' : 'rgba(148, 163, 184, 0.35)',
  )
  const barBorderColors = props.monthly.map((m) =>
    m.month === props.selectedMonth ? 'rgb(2, 132, 199)' : 'rgba(148, 163, 184, 0.55)',
  )

  return {
    labels: monthLabels.value,
    datasets: [
      {
        type: 'line' as const,
        label: t('weather.chart.avgHigh'),
        data: highTemps,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(251, 146, 60, 0.14)',
        borderWidth: 2.5,
        pointRadius: props.monthly.map((m) => (m.month === props.selectedMonth ? 6 : 3)),
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        tension: 0.35,
        fill: '+1',
        yAxisID: 'yTemp',
        order: 1,
      },
      {
        type: 'line' as const,
        label: t('weather.chart.avgLow'),
        data: lowTemps,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2.5,
        pointRadius: props.monthly.map((m) => (m.month === props.selectedMonth ? 6 : 3)),
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        tension: 0.35,
        fill: false,
        yAxisID: 'yTemp',
        order: 2,
      },
      {
        type: 'bar' as const,
        label: t('weather.chart.rainyDays'),
        data: rainyDays,
        backgroundColor: barColors,
        borderColor: barBorderColors,
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'yRain',
        order: 3,
      },
    ],
  }
}

function buildConfig(): ChartConfiguration {
  return {
    type: 'bar',
    data: buildChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      onClick: (_event, elements) => {
        const clickedMonth = elements[0] ? props.monthly[elements[0].index]?.month : undefined
        if (clickedMonth) {
          emit('selectMonth', clickedMonth)
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: (items) => {
              const label = items[0]?.label ?? ''
              return `${props.stationLabel} — ${label}`
            },
            label: (ctx) => {
              const val = ctx.parsed.y
              if (ctx.dataset.yAxisID === 'yTemp') {
                return ` ${ctx.dataset.label}: ${val}°C`
              }
              const monthData = props.monthly[ctx.dataIndex]
              const precipText = monthData ? ` (${monthData.precipMm} mm)` : ''
              return ` ${ctx.dataset.label}: ${val} ${t('weather.daysUnit')}${precipText}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        yTemp: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: '°C',
            font: { size: 11 },
          },
          suggestedMin: -2,
          suggestedMax: 34,
          grid: { color: 'rgba(226, 232, 240, 0.7)' },
        },
        yRain: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: t('weather.chart.rainAxis'),
            font: { size: 11 },
          },
          min: 0,
          suggestedMax: 22,
          grid: { drawOnChartArea: false },
        },
      },
    },
  }
}

function initChart() {
  if (!canvasRef.value) return
  try {
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) {
      canvasFailed.value = true
      return
    }
    chartInstance.value = new Chart(ctx, buildConfig())
  } catch (error) {
    console.error('[ClimateChart] 初始化圖表失敗:', { stationLabel: props.stationLabel, error })
    canvasFailed.value = true
  }
}

function updateChart() {
  if (!chartInstance.value) return
  chartInstance.value.data = buildChartData()
  if (chartInstance.value.options.scales?.yRain && 'title' in chartInstance.value.options.scales.yRain) {
    const scale = chartInstance.value.options.scales.yRain as { title?: { text?: string } }
    if (scale.title) {
      scale.title.text = t('weather.chart.rainAxis')
    }
  }
  chartInstance.value.update('none')
}

onMounted(() => {
  initChart()
})

watch(
  () => [props.monthly, props.selectedMonth, props.stationLabel, locale.value],
  () => {
    updateChart()
  },
)

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>

<template>
  <div v-if="!canvasFailed" class="space-y-3" data-testid="climate-chart-wrap">
    <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
      <button
        v-for="item in legendItems"
        :key="item.index"
        type="button"
        @click="toggleDataset(item.index)"
        :class="[
          'inline-flex items-center gap-2 text-xs text-slate-600 transition-opacity cursor-pointer',
          hiddenDatasets[item.index] ? 'opacity-40 line-through' : 'hover:text-slate-900',
        ]"
      >
        <span :class="['h-2.5 w-2.5 rounded-full shrink-0', item.dotClass]"></span>
        <span>{{ item.label }}</span>
      </button>
    </div>

    <div class="relative h-72 sm:h-80 w-full">
      <canvas
        ref="canvasRef"
        data-testid="climate-chart-canvas"
        :aria-label="stationLabel"
        role="img"
      ></canvas>
    </div>
  </div>
</template>
