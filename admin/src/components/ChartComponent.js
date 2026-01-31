// src/components/ui/ChartComponent.jsx
import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ChartComponent = ({ users }) => {
  let data
  if (users !== null) {
    const admins = users.filter((user) => user.role === 'admin')
    const students = users.filter((user) => user.role === 'studnet')
    const teachers = users.filter((user) => user.role === 'teacher')
    data = {
      labels: ['الطلاب', 'المعلمين', 'الإداريين'],
      datasets: [
        {
          label: 'عدد المستخدمين',
          data: [students?.length, teachers?.length, admins?.length],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)'
          ],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 205, 86, 1)'],
          borderWidth: 1
        }
      ]
    }
  } else {
    data = {
      labels: ['الطلاب', 'المعلمين', 'الإداريين'],
      datasets: [
        {
          label: 'عدد المستخدمين',
          data: [1, 2, 3],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)'
          ],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 205, 86, 1)'],
          borderWidth: 1
        }
      ]
    }
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        rtl: true
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return <Bar data={data} options={options} />
}

export default ChartComponent
