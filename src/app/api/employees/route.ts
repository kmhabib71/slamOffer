import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { employeeDatabase } from '@/lib/employee-db'
import { EmployeeRole, EmployeeStatus } from '@/lib/models/employee'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as EmployeeRole
    const status = searchParams.get('status') as EmployeeStatus
    const teamId = searchParams.get('team_id')

    const filters: any = {}
    if (role) filters.role = role
    if (status) filters.status = status
    if (teamId) filters.team_id = teamId

    const employees = await employeeDatabase.getEmployeesByUser((session.user as any).id, filters)

    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length,
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      role,
      status,
      assigned_methods,
      daily_lead_target,
      weekly_lead_target,
      monthly_lead_target,
      compensation_model,
      team_id,
      manager_id,
      system_permissions,
    } = body

    // Validate required fields
    if (!employee_id || !first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: employee_id, first_name, last_name, email, role' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists
    const existingEmployee = await employeeDatabase.getEmployeeById(employee_id)
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
    }

    // Create the employee
    const newEmployee = await employeeDatabase.createEmployee({
      user_id: (session.user as any).id,
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      role,
      status: status || 'active',
      hire_date: new Date(),
      assigned_methods: assigned_methods || [],
      daily_lead_target: daily_lead_target || 10,
      weekly_lead_target: weekly_lead_target || 50,
      monthly_lead_target: monthly_lead_target || 200,
      performance_metrics: {
        total_leads_generated: 0,
        total_qualified_leads: 0,
        total_converted_leads: 0,
        conversion_rate: 0,
        avg_lead_quality_score: 0,
        current_streak_days: 0,
        best_streak_days: 0,
      },
      compensation_model: compensation_model || {},
      training_status: {
        onboarding_completed: false,
        training_modules_completed: [],
        certification_level: 'beginner',
      },
      team_id,
      manager_id,
      system_permissions: system_permissions || {
        can_access_crm: true,
        can_view_all_leads: false,
        can_edit_lead_status: true,
        can_assign_leads: false,
        can_view_analytics: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: newEmployee,
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
