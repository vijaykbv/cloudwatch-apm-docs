'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface DiagnosticRunnerProps {
  className?: string
}

interface DiagnosticCommand {
  id: string
  name: string
  description: string
  command: string
  category: 'system' | 'network' | 'cloudwatch' | 'logs'
  estimatedTime: number
}

interface CommandExecution {
  command: DiagnosticCommand
  isRunning: boolean
  output?: string
  error?: string
  exitCode?: number
  startTime: Date
  endTime?: Date
}

export default function DiagnosticRunner({ className = '' }: DiagnosticRunnerProps) {
  const [executions, setExecutions] = useState<CommandExecution[]>([])
  const [selectedCommands, setSelectedCommands] = useState<Set<string>>(new Set())

  const diagnosticCommands: DiagnosticCommand[] = [
    {
      id: 'agent-status',
      name: 'Check CloudWatch Agent Status',
      description: 'Verify if the CloudWatch agent is running and healthy',
      command: 'sudo systemctl status amazon-cloudwatch-agent',
      category: 'cloudwatch',
      estimatedTime: 5
    },
    {
      id: 'agent-config',
      name: 'Validate Agent Configuration',
      description: 'Check the CloudWatch agent configuration file for errors',
      command: 'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a validate-config -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
      category: 'cloudwatch',
      estimatedTime: 10
    },
    {
      id: 'network-connectivity',
      name: 'Test CloudWatch Connectivity',
      description: 'Test network connectivity to CloudWatch endpoints',
      command: 'curl -I https://monitoring.us-east-1.amazonaws.com',
      category: 'network',
      estimatedTime: 5
    },
    {
      id: 'disk-space',
      name: 'Check Disk Space',
      description: 'Verify available disk space for logs and temporary files',
      command: 'df -h',
      category: 'system',
      estimatedTime: 2
    },
    {
      id: 'memory-usage',
      name: 'Check Memory Usage',
      description: 'Monitor system memory usage and CloudWatch agent consumption',
      command: 'free -h && ps aux | grep amazon-cloudwatch-agent',
      category: 'system',
      estimatedTime: 3
    },
    {
      id: 'agent-logs',
      name: 'View Agent Logs',
      description: 'Display recent CloudWatch agent log entries',
      command: 'sudo tail -50 /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log',
      category: 'logs',
      estimatedTime: 5
    },
    {
      id: 'iam-permissions',
      name: 'Check IAM Permissions',
      description: 'Verify IAM role and permissions for CloudWatch access',
      command: 'aws sts get-caller-identity && aws iam get-role --role-name CloudWatchAgentServerRole',
      category: 'cloudwatch',
      estimatedTime: 8
    },
    {
      id: 'port-check',
      name: 'Check Network Ports',
      description: 'Verify that required network ports are available',
      command: 'netstat -tuln | grep -E "(443|80)"',
      category: 'network',
      estimatedTime: 3
    }
  ]

  const categories = Array.from(new Set(diagnosticCommands.map(cmd => cmd.category)))

  const getCategoryIcon = (category: string) => {
    const icons = {
      system: '💻',
      network: '🌐',
      cloudwatch: '☁️',
      logs: '📝'
    }
    return icons[category as keyof typeof icons] || '🔧'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      network: 'bg-green-100 text-green-800',
      cloudwatch: 'bg-orange-100 text-orange-800',
      logs: 'bg-purple-100 text-purple-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const toggleCommandSelection = (commandId: string) => {
    const newSelected = new Set(selectedCommands)
    if (newSelected.has(commandId)) {
      newSelected.delete(commandId)
    } else {
      newSelected.add(commandId)
    }
    setSelectedCommands(newSelected)
  }

  const selectAllInCategory = (category: string) => {
    const categoryCommands = diagnosticCommands.filter(cmd => cmd.category === category)
    const newSelected = new Set(selectedCommands)
    categoryCommands.forEach(cmd => newSelected.add(cmd.id))
    setSelectedCommands(newSelected)
  }

  const runSelectedCommands = async () => {
    const commandsToRun = diagnosticCommands.filter(cmd => selectedCommands.has(cmd.id))
    
    for (const command of commandsToRun) {
      const execution: CommandExecution = {
        command,
        isRunning: true,
        startTime: new Date()
      }

      setExecutions(prev => [execution, ...prev])

      // Simulate command execution
      try {
        await new Promise(resolve => setTimeout(resolve, command.estimatedTime * 200)) // Simulate execution time
        
        const mockOutput = generateMockOutput(command)
        const mockExitCode = Math.random() > 0.1 ? 0 : 1 // 90% success rate
        
        setExecutions(prev => prev.map(exec => 
          exec === execution 
            ? { 
                ...exec, 
                isRunning: false, 
                output: mockOutput,
                exitCode: mockExitCode,
                endTime: new Date(),
                error: mockExitCode !== 0 ? 'Command failed with non-zero exit code' : undefined
              }
            : exec
        ))
      } catch (error) {
        setExecutions(prev => prev.map(exec => 
          exec === execution 
            ? { 
                ...exec, 
                isRunning: false, 
                error: 'Command execution failed',
                exitCode: 1,
                endTime: new Date()
              }
            : exec
        ))
      }
    }

    setSelectedCommands(new Set()) // Clear selection after running
  }

  const generateMockOutput = (command: DiagnosticCommand): string => {
    switch (command.id) {
      case 'agent-status':
        return `● amazon-cloudwatch-agent.service - Amazon CloudWatch Agent
   Loaded: loaded (/etc/systemd/system/amazon-cloudwatch-agent.service; enabled; vendor preset: disabled)
   Active: active (running) since Mon 2024-01-15 10:30:45 UTC; 2h 15min ago
 Main PID: 1234 (amazon-cloudwat)
    Tasks: 8 (limit: 4915)
   Memory: 45.2M
   CGroup: /system.slice/amazon-cloudwatch-agent.service
           └─1234 /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent`

      case 'agent-config':
        return Math.random() > 0.8 
          ? `Configuration validation failed: Invalid JSON syntax at line 23`
          : `Configuration validation successful`

      case 'network-connectivity':
        return `HTTP/1.1 200 OK
Date: Mon, 15 Jan 2024 12:45:30 GMT
Content-Type: text/html
Content-Length: 1234
Connection: keep-alive
Server: AmazonS3`

      case 'disk-space':
        return `Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1       20G  8.5G   11G  45% /
/dev/xvdb       100G   45G   50G  48% /var/log
tmpfs           2.0G     0  2.0G   0% /dev/shm`

      case 'memory-usage':
        return `              total        used        free      shared  buff/cache   available
Mem:           4.0G        1.2G        1.8G         12M        1.0G        2.6G
Swap:          2.0G          0B        2.0G

root      1234  0.5  1.1  123456  45678 ?        Sl   10:30   0:15 /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent`

      case 'agent-logs':
        return `2024-01-15T12:45:30Z [INFO] CloudWatch agent started successfully
2024-01-15T12:45:31Z [INFO] Configuration loaded from /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
2024-01-15T12:45:32Z [INFO] Starting metric collection
2024-01-15T12:45:33Z [INFO] Connected to CloudWatch endpoint
2024-01-15T12:45:34Z [INFO] First metric batch sent successfully`

      case 'iam-permissions':
        return `{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:sts::123456789012:assumed-role/CloudWatchAgentServerRole/i-1234567890abcdef0"
}

{
    "Role": {
        "RoleName": "CloudWatchAgentServerRole",
        "AssumeRolePolicyDocument": "%7B%22Version%22%3A%222012-10-17%22%7D",
        "CreateDate": "2024-01-01T00:00:00Z"
    }
}`

      case 'port-check':
        return `tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp6       0      0 :::80                   :::*                    LISTEN
tcp6       0      0 :::443                  :::*                    LISTEN`

      default:
        return 'Command executed successfully'
    }
  }

  const getExecutionDuration = (execution: CommandExecution): string => {
    if (!execution.endTime) return 'Running...'
    const duration = execution.endTime.getTime() - execution.startTime.getTime()
    return `${(duration / 1000).toFixed(1)}s`
  }

  const getStatusColor = (execution: CommandExecution): string => {
    if (execution.isRunning) return 'text-blue-600 bg-blue-50'
    if (execution.error || execution.exitCode !== 0) return 'text-red-600 bg-red-50'
    return 'text-green-600 bg-green-50'
  }

  const getStatusText = (execution: CommandExecution): string => {
    if (execution.isRunning) return 'RUNNING'
    if (execution.error || execution.exitCode !== 0) return 'FAILED'
    return 'SUCCESS'
  }

  return (
    <div className={`diagnostic-runner ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Diagnostic Command Runner</h1>
        <p className="text-lg text-gray-600">
          Run diagnostic commands to gather system information and troubleshoot issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Selection */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select Commands</h2>
              <span className="text-sm text-gray-500">
                {selectedCommands.size} selected
              </span>
            </div>

            <div className="space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <button
                      onClick={() => selectAllInCategory(category)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="space-y-2 ml-6">
                    {diagnosticCommands
                      .filter(cmd => cmd.category === category)
                      .map(command => (
                        <label key={command.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCommands.has(command.id)}
                            onChange={() => toggleCommandSelection(command.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{command.name}</div>
                            <div className="text-xs text-gray-600">{command.description}</div>
                            <div className="text-xs text-gray-500 mt-1">~{command.estimatedTime}s</div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={runSelectedCommands}
                disabled={selectedCommands.size === 0 || executions.some(exec => exec.isRunning)}
                className="w-full"
              >
                {executions.some(exec => exec.isRunning) 
                  ? 'Running Commands...' 
                  : `Run Selected Commands (${selectedCommands.size})`
                }
              </Button>
            </div>
          </Card>
        </div>

        {/* Execution Results */}
        <div className="lg:col-span-2">
          {executions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Execution Results</h2>
              {executions.map((execution, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getCategoryIcon(execution.command.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{execution.command.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(execution.command.category)}`}>
                          {execution.command.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{execution.command.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution)}`}>
                        {getStatusText(execution)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {getExecutionDuration(execution)}
                      </div>
                    </div>
                  </div>

                  {/* Command */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Command:</h4>
                    <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                      <code>{execution.command.command}</code>
                    </pre>
                  </div>

                  {/* Output */}
                  {execution.isRunning ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Running command...</span>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Output {execution.exitCode !== undefined && `(Exit Code: ${execution.exitCode})`}:
                      </h4>
                      {execution.error ? (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <pre className="text-sm text-red-700 whitespace-pre-wrap">{execution.error}</pre>
                        </div>
                      ) : (
                        <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                          <code>{execution.output}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Commands Executed</h3>
              <p className="text-gray-600">
                Select diagnostic commands from the left panel and click "Run Selected Commands" to begin.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}