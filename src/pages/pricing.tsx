// import { title } from "@/components/primitives";
// import DefaultLayout from "@/layouts/default";

// export default function DocsPage() {
//   return (
//     <DefaultLayout>
//       <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
//         <div className="inline-block max-w-lg text-center justify-center">
//           <h1 className={title()}>Pricing</h1>
//         </div>
//       </section>
//     </DefaultLayout>
//   );
// }


import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, ChartData, ChartOptions } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import ReactApexChart from 'react-apexcharts';
import CountUp from 'react-countup';
import axiosInstance from '../utils/axiosInstance';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

interface HourlyActivity {
  hour: number;
  count: number;
}

interface Speaker {
  name: string;
  count: number;
}

interface DailySession {
  day: string;
  count: number;
}

interface PriorityLevel {
  _id: number;
  count: number;
}

interface SessionType {
  _id: number;
  count: number;
}

interface PriorityLevelMapped {
  priority: string;
  count: number;
}

interface SessionTypeMapped {
  sessionType: string;
  count: number;
}

interface ActiveUser {
  name: string;
  totalDuration: number;
}

enum SESSION_PRIORITY {
  ANY = -1,
  NONE = 0,
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
  EMERGENCY = 5,
}

enum SESSION_TYPE {
  OTHER = 0,
  CONFERENCE = 1,
  RADIO = 2,
  ADHOC = 3,
  PRIVATE_GROUP = 4,
  PRIVATE_EMERGENCY = 5,
  ONE_TO_ONE = 7,
  ANY = 8,
  GR_BROADCAST = 10,
  OR_BROADCAST = 11,
  BROADCAST = 12,
}

export default function DocsPage() {
  const { t } = useTranslation();
  const [interval, setInterval] = useState('1M');
  const [sessionDistribution, setSessionDistribution] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [priorityLevels, setPriorityLevels] = useState<PriorityLevel[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<Speaker[]>([]);
  const [averageSessionDuration, setAverageSessionDuration] = useState(0);
  const [averageBurstDuration, setAverageBurstDuration] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalBursts, setTotalBursts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sessionsByDay, setSessionsByDay] = useState<DailySession[]>([]);
  const [topActiveUsers, setTopActiveUsers] = useState<ActiveUser[]>([]);

  const stats = [
    { label: t('totalUsers'), value: totalUsers, suffix: '+' },
    { label: t('totalSessions'), value: totalSessions, suffix: '+' },
    { label: t('totalBursts'), value: totalBursts, suffix: '+' },
  ];

  const priorityDescriptions: { [key: number]: string } = {
    [SESSION_PRIORITY.ANY]: t('sessionPriorities.ANY'),
    [SESSION_PRIORITY.NONE]: t('sessionPriorities.NONE'),
    [SESSION_PRIORITY.LOW]: t('sessionPriorities.LOW'),
    [SESSION_PRIORITY.NORMAL]: t('sessionPriorities.NORMAL'),
    [SESSION_PRIORITY.HIGH]: t('sessionPriorities.HIGH'),
    [SESSION_PRIORITY.URGENT]: t('sessionPriorities.URGENT'),
    [SESSION_PRIORITY.EMERGENCY]: t('sessionPriorities.EMERGENCY'),
  };

  const sessionTypeDescriptions: { [key: number]: string } = {
    [SESSION_TYPE.OTHER]: t('sessionTypes.OTHER'),
    [SESSION_TYPE.CONFERENCE]: t('sessionTypes.CONFERENCE'),
    [SESSION_TYPE.RADIO]: t('sessionTypes.RADIO'),
    [SESSION_TYPE.ADHOC]: t('sessionTypes.ADHOC'),
    [SESSION_TYPE.PRIVATE_GROUP]: t('sessionTypes.PRIVATE_GROUP'),
    [SESSION_TYPE.PRIVATE_EMERGENCY]: t('sessionTypes.PRIVATE_EMERGENCY'),
    [SESSION_TYPE.ONE_TO_ONE]: t('sessionTypes.ONE_TO_ONE'),
    [SESSION_TYPE.ANY]: t('sessionTypes.ANY'),
    [SESSION_TYPE.GR_BROADCAST]: t('sessionTypes.GR_BROADCAST'),
    [SESSION_TYPE.OR_BROADCAST]: t('sessionTypes.OR_BROADCAST'),
    [SESSION_TYPE.BROADCAST]: t('sessionTypes.BROADCAST'),
  };

  const fetchData = async (interval: string) => {
    const token = Cookies.get('token');
    let startTime, endTime;

    const now = new Date();
    switch (interval) {
      case '1M':
      default:
        startTime = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        break;
      case '6M':
        startTime = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
        break;
      case '1Y':
        startTime = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
        break;
      case 'YTD':
        startTime = new Date(now.getFullYear(), 0, 1).getTime();
        break;
      case 'ALL':
        startTime = 0;
        break;
    }
    endTime = now.getTime();

    try {
      const [
        sessionDistributionResponse,
        hourlyActivityResponse,
        priorityLevelsResponse,
        sessionTypesResponse,
        topSpeakersResponse,
        averageSessionDurationResponse,
        averageBurstDurationResponse,
        totalSessionsResponse,
        totalBurstsResponse,
        totalUsersResponse,
        sessionsByDayResponse,
        topActiveUsersResponse
      ] = await Promise.all([
        axiosInstance.get(`/dashboard-session-distribution`, {
          params: { startTime, endTime, interval },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-hourly-session-activity`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-priority-levels-overview`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-session-types-breakdown`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-top-speakers`, {
          params: { startTime, endTime, limit: 20 },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-average-session-duration`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-average-burst-duration`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-total-sessions`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-total-bursts`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-total-users`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-sessions-by-day`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get(`/dashboard-top-active-users`, {
          params: { startTime, endTime },
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setSessionDistribution(sessionDistributionResponse.data);
      setHourlyActivity(hourlyActivityResponse.data);
      setPriorityLevels(priorityLevelsResponse.data.map((level: PriorityLevel): PriorityLevelMapped => ({
        priority: priorityDescriptions[level._id] || t('sessionPriorities.UNKNOWN'),
        count: level.count
      })));
      setSessionTypes(sessionTypesResponse.data.map((type: SessionType): SessionTypeMapped => ({
        sessionType: sessionTypeDescriptions[type._id] || t('sessionTypes.UNKNOWN'),
        count: type.count
      })));
      setTopSpeakers(topSpeakersResponse.data);
      setAverageSessionDuration(averageSessionDurationResponse.data.averageSessionDuration);
      setAverageBurstDuration(averageBurstDurationResponse.data.averageBurstDuration);
      setTotalSessions(totalSessionsResponse.data.totalSessions);
      setTotalBursts(totalBurstsResponse.data.totalBursts);
      setTotalUsers(totalUsersResponse.data.totalUsers);
      setSessionsByDay(sessionsByDayResponse.data);
      setTopActiveUsers(topActiveUsersResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData('1M');
  }, []);

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
    fetchData(newInterval);
  };

  const sessionDistributionData = {
    series: [{
      name: 'Sessions',
      data: sessionDistribution.map((item: any) => [item._id, item.count])
    }],
    options: {
      chart: {
        id: 'session-distribution',
        type: 'area' as const,
        height: 350,
        zoom: { enabled: true }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const },
      xaxis: {
        type: 'datetime' as const,
        labels: { datetimeUTC: false }
      },
      tooltip: {
        x: { format: 'dd MMM yyyy' }
      }
    }
  };

  const barData: ChartData<'bar'> = {
    labels: hourlyActivity.map(activity => activity.hour),
    datasets: [{
      label: t('numberOfSessions'),
      data: hourlyActivity.map(activity => activity.count),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const barOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: true }
    }
  };

  const priorityPieData = {
    labels: priorityLevels.map(level => level.priority),
    datasets: [{
      label: t('numOfSessions'),
      data: priorityLevels.map(level => level.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const typePieData: ChartData<'pie', number[], string> = {
    labels: sessionTypes.map(type => type.sessionType),
    datasets: [{
      label: t('numOfSessions'),
      data: sessionTypes.map(type => type.count),
      backgroundColor: [
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const senderBarData = {
    labels: topSpeakers.map(speaker => speaker.name),
    datasets: [{
      label: t('numOfSessions'),
      data: topSpeakers.map(speaker => speaker.count),
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }],
  };

  const sessionsByDayData: ChartData<'bar', number[], string> = {
    labels: sessionsByDay.map(day => day.day),
    datasets: [
      {
        type: 'bar' as const,
        label: t('numberOfSessions'),
        data: sessionsByDay.map(day => day.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: t('trend'),
        data: sessionsByDay.map(day => day.count),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      }
    ],
  };

  const topActiveUsersData = {
    labels: topActiveUsers.map(user => user.name),
    datasets: [{
      label: t('topActiveUsers'),
      data: topActiveUsers.map(user => user.totalDuration / 1000),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold">{t('sessionDistribution')}</h2>
              <div className="flex flex-wrap gap-2">
                {['1M', '6M', '1Y', 'YTD', 'ALL'].map((option) => (
                  <Button 
                    key={option}
                    size="sm"
                    variant={interval === option ? "solid" : "flat"}
                    onClick={() => handleIntervalChange(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <ReactApexChart options={sessionDistributionData.options} series={sessionDistributionData.series} type="area" height={300} />
          </Card>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <h2 className="text-3xl font-bold mb-2">
                <CountUp end={stat.value} duration={2.5} separator="," />
                {stat.suffix}
              </h2>
              <p className="text-gray-600">{stat.label}</p>
            </Card>
          ))}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('averageSessionDuration')}</h4>
            <p className="text-2xl font-bold">{averageSessionDuration}</p>
          </Card>
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('averageBurstDuration')}</h4>
            <p className="text-2xl font-bold">{averageBurstDuration}</p>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('hourlySessionActivity')}</h4>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('sessionsByDay')}</h4>
            <div className="h-80">
              <Bar data={sessionsByDayData} options={barOptions} />
            </div>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('priorityLevelsOverview')}</h4>
            <div className="h-80">
              <Pie data={priorityPieData} options={pieOptions} />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('sessionTypesBreakdown')}</h4>
            <div className="h-80">
              <Pie data={typePieData} options={pieOptions} />
            </div>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('topSpeakers')}</h4>
            <div className="h-96">
              <Bar data={senderBarData} options={barOptions} />
            </div>
          </Card>
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">{t('topActiveUsers')}</h4>
            <div className="h-96">
              <Bar data={topActiveUsersData} options={barOptions} />
            </div>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
  
};