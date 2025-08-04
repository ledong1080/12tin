

import React from "react";
import { createRoot } from "react-dom/client";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);


// --- MOCK DATA ---
const mockClasses = [
    { id: '10A1', name: '10A1' },
    { id: '11A1', name: '11A1' },
    { id: '12A1', name: '12 Chuyên Lý' },
    { id: 'CT', name: '12 Chuyên Tin' },
];

const mockStudentsData = [
    { id: 1, student_code: 'HS001', full_name: 'Nguyễn Văn An', date_of_birth: '2006-05-10', gender: 'Nam', class_id: '10A1', class_name: '10A1', parent_phone: '0123456789', parent_zalo: '0123456789', address: '123 Đường ABC, Quận 1, TP. HCM' },
    { id: 2, student_code: 'HS002', full_name: 'Trần Thị Bình', date_of_birth: '2006-08-15', gender: 'Nữ', class_id: '10A1', class_name: '10A1', parent_phone: '0123456790', parent_zalo: '', address: '456 Đường XYZ, Quận 2, TP. HCM' },
    { id: 4, student_code: 'HS004', full_name: 'Phạm Thị Dung', date_of_birth: '2006-11-01', gender: 'Nữ', class_id: '11A1', class_name: '11A1', parent_phone: '0123456792', parent_zalo: '', address: '101 Đường PQR, Quận 4, TP. HCM' },
    { id: 3, student_code: 'CL2024001', full_name: 'Lê Văn Cường', date_of_birth: '2006-03-20', gender: 'Nam', class_id: '12A1', class_name: '12 Chuyên Lý', parent_phone: '0905123456', parent_zalo: '0905123456', address: '789 Đường KLM, Quận 3, TP. HCM' },
];

const mockViolationsData = [
    { id: 1, student_id: 2, violation_date: '2025-07-30T09:15:00Z', violation_type: ['Đi học trễ', 'Vi phạm khác'], description: "Đến trễ 15 phút.", points_deducted: 5, severity_level: 'Nhẹ', status: 'Đã giải quyết', reported_by: 'tin12@gmail.com', resolved_date: '2025-07-30T14:00:00Z', violation_count: 1 },
    { id: 2, student_id: 1, violation_date: '2025-07-30T08:00:00Z', violation_type: ['Không Huy hiệu Đoàn', 'Không trực nhật'], description: "", points_deducted: 3, severity_level: 'Nhẹ', status: 'Đã giải quyết', reported_by: 'tin12@gmail.com', resolved_date: '2025-07-30T16:30:00Z', violation_count: 1 },
    { id: 3, student_id: 3, violation_date: '2025-07-29T10:00:00Z', violation_type: ['Sử dụng điện thoại'], description: 'Sử dụng điện thoại trong giờ học', points_deducted: 10, severity_level: 'Nặng', status: 'Chưa giải quyết', reported_by: 'giaovienly@email.com', resolved_date: null, violation_count: 1 },
    { id: 4, student_id: 4, violation_date: '2025-07-28T11:20:00Z', violation_type: ['Mất trật tự'], description: 'Nói chuyện riêng, làm ồn', points_deducted: 2, severity_level: 'Nhẹ', status: 'Đã giải quyết', reported_by: 'giamthi@email.com', resolved_date: '2025-07-28T11:30:00Z', violation_count: 1 },
    { id: 5, student_id: 2, violation_date: '2025-07-25T07:15:00Z', violation_type: ['Không đồng phục'], description: 'Sai đồng phục', points_deducted: 1, severity_level: 'Nhẹ', status: 'Đã giải quyết', reported_by: 'saodo@email.com', resolved_date: '2025-07-25T07:20:00Z', violation_count: 2 },
];


const mockAbsencesData = [
    { student_id: 1, date: new Date().toISOString() }, // Nguyễn Văn An is absent today
    { student_id: 2, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() }, // Trần Thị Bình absent 2 days ago
    { student_id: 4, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() }, // Phạm Thị Dung absent 3 days ago
];

const violationTypes = [
    "Không học bài", "Đi học trễ", "Không đồng phục", "Không Huy hiệu Đoàn", "Không trực nhật", "Sử dụng điện thoại", "Mất trật tự", "Vi phạm khác",
];
// --- END MOCK DATA ---

interface AttendanceRecord {
  status: string;
  attitude: number;
  extracurricular: boolean;
  notes: string;
}

interface AttendanceRecords {
    [dateKey: string]: {
        [studentId: number]: AttendanceRecord;
    }
}

const getInitialAttendanceRecord = (): AttendanceRecord => ({
    status: 'Có mặt',
    attitude: 5,
    extracurricular: true,
    notes: '',
});

function MainComponent() {
  const [currentView, setCurrentView] = React.useState("violations");
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // Default to logged in for showcase
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    dailyViolationsCount: 0,
    dailyAttendance: 0,
    dailyAbsentees: 0,
    weeklyAbsentees: 0,
  });
  const [dailyViolations, setDailyViolations] = React.useState([]);
  const [weeklyViolations, setWeeklyViolations] = React.useState([]);
  const [dailyAbsenceDetails, setDailyAbsenceDetails] = React.useState([]);
  const [weeklyAbsenceDetails, setWeeklyAbsenceDetails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("");
  const [students, setStudents] = React.useState(mockStudentsData);
  const [classes, setClasses] = React.useState(mockClasses);
  const [violations, setViolations] = React.useState(mockViolationsData);
  const [absences, setAbsences] = React.useState(mockAbsencesData);
  
  const [showStudentModal, setShowStudentModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState(null);
  const [studentForm, setStudentForm] = React.useState({
    student_code: "",
    full_name: "",
    date_of_birth: "",
    gender: "Nam",
    class_id: "",
    parent_phone: "",
    parent_zalo: "",
    address: "",
  });
  const [importFile, setImportFile] = React.useState(null);
  const [importResults, setImportResults] = React.useState(null);
  
  // State for Attendance View
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecords>({});
  
  // State for Violations View
  const [violationSearchTerm, setViolationSearchTerm] = React.useState("");
  const [violationSelectedClass, setViolationSelectedClass] = React.useState("");
  const [violationSeverityFilter, setViolationSeverityFilter] = React.useState("");
  const [violationStatusFilter, setViolationStatusFilter] = React.useState("");
  const [showViolationModal, setShowViolationModal] = React.useState(false);
  const [editingViolation, setEditingViolation] = React.useState(null);
  const [violationForm, setViolationForm] = React.useState({
    id: null,
    student_id: '',
    violation_type: [],
    description: '',
    severity_level: 'Nhẹ',
    points_deducted: 5,
    violation_date: new Date().toISOString().split('T')[0],
    violation_count: 1,
    reported_by: 'tin12@gmail.com',
  });


  // Date formatting logic
  const today = new Date();
  const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const formattedDate = `Hôm nay là ${weekdays[today.getDay()]}, ${today.getDate()} tháng ${today.getMonth() + 1}, ${today.getFullYear()}`;

  const filteredStudents = students.filter(student => 
      (selectedClass ? student.class_id === selectedClass : true) &&
      (searchTerm ? 
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          student.student_code.toLowerCase().includes(searchTerm.toLowerCase()) 
      : true)
  );
  
  const filteredViolations = violations.map(v => ({
      ...v,
      student: students.find(s => s.id === v.student_id)
  })).filter(v => {
      if (!v.student) return false;
      const classMatch = violationSelectedClass ? v.student.class_id === violationSelectedClass : true;
      const searchMatch = violationSearchTerm ?
          v.student.full_name.toLowerCase().includes(violationSearchTerm.toLowerCase()) ||
          v.description.toLowerCase().includes(violationSearchTerm.toLowerCase()) ||
          (Array.isArray(v.violation_type) && v.violation_type.join(', ').toLowerCase().includes(violationSearchTerm.toLowerCase())) ||
          v.student.student_code.toLowerCase().includes(violationSearchTerm.toLowerCase())
          : true;
      const severityMatch = violationSeverityFilter ? v.severity_level === violationSeverityFilter : true;
      const statusMatch = violationStatusFilter ? v.status === violationStatusFilter : true;
      return classMatch && searchMatch && severityMatch && statusMatch;
  });

  React.useEffect(() => {
    loadDashboardData();
  }, [students, violations, absences]);

  React.useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    if (currentView === 'attendance') {
        setAttendanceRecords(prev => {
            const currentRecordsForDate = prev[dateKey] || {};
            const newRecordsForDate = { ...currentRecordsForDate };
            let hasChanges = false;

            filteredStudents.forEach(student => {
                if (!newRecordsForDate[student.id]) {
                    newRecordsForDate[student.id] = getInitialAttendanceRecord();
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                return { ...prev, [dateKey]: newRecordsForDate };
            }
            return prev;
        });
    }
  }, [filteredStudents, selectedDate, currentView]);

  const calculateConductScore = (student) => {
    if (!student) return 0;
    const baseScore = 100;
    const studentViolations = violations.filter(v => v.student_id === student.id);
    let totalDeduction = 0;
    studentViolations.forEach(v => {
        totalDeduction += v.points_deducted || 0;
    });
    return Math.max(0, baseScore - totalDeduction);
  };

  const loadDashboardData = () => {
    setLoading(true);
    setTimeout(() => {
        const today = new Date();
        const todayString = today.toDateString();

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyV = violations.filter(v => new Date(v.violation_date).toDateString() === todayString);
        const weeklyV = violations
            .filter(v => {
                const violationDate = new Date(v.violation_date);
                return violationDate >= sevenDaysAgo && violationDate <= today;
            })
            .sort((a, b) => new Date(b.violation_date).getTime() - new Date(a.violation_date).getTime());
        
        const dailyA = absences.filter(a => new Date(a.date).toDateString() === todayString);
        const weeklyA = absences
            .filter(a => {
                const absenceDate = new Date(a.date);
                return absenceDate >= sevenDaysAgo && absenceDate <= today;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setDailyViolations(dailyV);
        setWeeklyViolations(weeklyV);
        setDailyAbsenceDetails(dailyA);
        setWeeklyAbsenceDetails(weeklyA);

        setStats({
            totalStudents: students.length,
            dailyViolationsCount: dailyV.length,
            dailyAttendance: students.length - dailyA.length,
            dailyAbsentees: dailyA.length,
            weeklyAbsentees: weeklyA.length,
        });
        setLoading(false);
    }, 500);
  };
  
    const handleOpenAddViolationModal = () => {
        if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
        setEditingViolation(null);
        setViolationForm({
            id: null, student_id: '', violation_type: [], description: '',
            severity_level: 'Nhẹ', points_deducted: 5, violation_date: new Date().toISOString().split('T')[0],
            violation_count: 1, reported_by: 'tin12@gmail.com',
        });
        setShowViolationModal(true);
    };

    const handleOpenEditViolationModal = (violation) => {
        if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
        setEditingViolation(violation);
        setViolationForm({
            ...violation,
            student_id: String(violation.student_id),
            violation_date: new Date(violation.violation_date).toISOString().split('T')[0],
        });
        setShowViolationModal(true);
    };

    const handleSaveViolation = (e) => {
        e.preventDefault();
        if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
        if (violationForm.violation_type.length === 0) {
            alert("Vui lòng chọn ít nhất một loại vi phạm.");
            return;
        }
        
        const finalViolation = {
            ...violationForm,
            student_id: parseInt(violationForm.student_id, 10),
            points_deducted: Number(violationForm.points_deducted) || 0,
            violation_count: Number(violationForm.violation_count) || 1,
        };

        if (editingViolation) {
            // Update: Merge new form data with the original full object to preserve status
            const updatedViolation = { ...editingViolation, ...finalViolation };
            setViolations(violations.map(v => v.id === editingViolation.id ? updatedViolation : v));
            alert("Cập nhật vi phạm thành công!");
        } else {
            // Create: Add new fields like status
            const newViolation = {
                ...finalViolation,
                id: Date.now(),
                status: 'Chưa giải quyết',
                resolved_date: null,
            };
            setViolations([newViolation, ...violations]);
            alert("Thêm vi phạm thành công!");
        }
        setShowViolationModal(false);
        setEditingViolation(null);
    };

    const handleDeleteViolation = (violationToDelete) => {
        if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");

        const student = students.find(s => s.id === violationToDelete.student_id);
        const studentName = student ? student.full_name : 'Học sinh không xác định';
        const violationDescription = Array.isArray(violationToDelete.violation_type) 
            ? violationToDelete.violation_type.join(', ') 
            : violationToDelete.violation_type;
    
        const confirmationMessage = `Bạn có chắc chắn muốn xóa vi phạm "${violationDescription}" của học sinh ${studentName}?`;

        if (window.confirm(confirmationMessage)) {
            setViolations(violations.filter(v => v.id !== violationToDelete.id));
            alert("Xóa vi phạm thành công!");
        }
    };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        alert("Vui lòng đăng nhập để thực hiện thao tác này!");
        return;
    }
    const className = classes.find(c => c.id === studentForm.class_id)?.name || '';
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...editingStudent, ...studentForm, class_name: className } : s));
      alert("Cập nhật học sinh thành công!");
    } else {
      const newStudent = { id: Date.now(), ...studentForm, class_name: className };
      setStudents([...students, newStudent]);
      alert("Thêm học sinh thành công!");
    }
    setShowStudentModal(false);
    setEditingStudent(null);
    setStudentForm({
      student_code: "", full_name: "", date_of_birth: "", gender: "Nam", class_id: "", parent_phone: "", parent_zalo: "", address: "",
    });
  };

  const handleImportStudents = () => {
    if (!importFile) return alert("Vui lòng chọn file CSV để import!");
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            if (typeof text !== 'string') throw new Error("Could not read file content as text.");
            const rows = text.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) throw new Error("File CSV rỗng hoặc chỉ có dòng tiêu đề.");
            const header = rows[0].trim().split(',').map(h => h.trim());
            const dataRows = rows.slice(1);
            const headerMap: Record<string, number> = header.reduce((acc: Record<string, number>, current, index) => { acc[current] = index; return acc; }, {});
            
            const results = { total: dataRows.length, success: 0, errors: 0, details: [] };
            const newStudentsFromImport = [];

            dataRows.forEach((row, index) => {
                const rowIndexInSheet = index + 2;
                const values = row.trim().split(',');
                const rowObj: Record<string, string> = {};
                for (const key in headerMap) rowObj[key] = values[headerMap[key]]?.trim();

                const requiredFields = ['student_code', 'full_name', 'date_of_birth', 'gender', 'class_name', 'parent_phone'];
                const missingFields = requiredFields.filter(field => !rowObj[field]);

                if (missingFields.length > 0) {
                    results.errors++;
                    results.details.push({ row: rowIndexInSheet, student_code: rowObj.student_code || 'N/A', status: 'Error', error: `Thiếu thông tin: ${missingFields.join(', ')}` });
                    return;
                }
                
                const studentClass = classes.find(c => c.name.trim().toLowerCase() === String(rowObj.class_name).trim().toLowerCase());
                if (!studentClass) {
                    results.errors++;
                    results.details.push({ row: rowIndexInSheet, student_code: rowObj.student_code, status: 'Error', error: `Lớp '${rowObj.class_name}' không tồn tại` });
                    return;
                }
                
                const studentCodeTrimmed = String(rowObj.student_code).trim();
                if (students.some(s => s.student_code.toLowerCase() === studentCodeTrimmed.toLowerCase()) || newStudentsFromImport.some(s => s.student_code.toLowerCase() === studentCodeTrimmed.toLowerCase())) {
                    results.errors++;
                    results.details.push({ row: rowIndexInSheet, student_code: rowObj.student_code, status: 'Error', error: `Mã học sinh đã tồn tại` });
                    return;
                }

                const newStudent = {
                    id: Date.now() + index, student_code: studentCodeTrimmed, full_name: String(rowObj.full_name),
                    date_of_birth: String(rowObj.date_of_birth), gender: String(rowObj.gender), class_id: studentClass.id,
                    class_name: studentClass.name, parent_phone: String(rowObj.parent_phone),
                    parent_zalo: String(rowObj.parent_zalo || ''), address: String(rowObj.address || ''),
                };
                newStudentsFromImport.push(newStudent);
                results.success++;
                results.details.push({ row: rowIndexInSheet, student_code: newStudent.student_code, status: 'Success' });
            });

            setStudents(prev => [...prev, ...newStudentsFromImport]);
            setImportResults(results);
        } catch (error) {
            console.error("Error importing file:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setImportResults({ total: 0, success: 0, errors: 1, details: [{row: 1, student_code: 'N/A', status: 'Error', error: `File không hợp lệ hoặc bị lỗi: ${errorMessage}`}] });
        } finally {
            setLoading(false);
        }
    };
    reader.onerror = () => { alert('Không thể đọc file.'); setLoading(false); };
    reader.readAsText(importFile, 'UTF-8');
  };
  
  const handleEditStudent = (student) => {
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
    setEditingStudent(student);
    setStudentForm({
      student_code: student.student_code, full_name: student.full_name, date_of_birth: student.date_of_birth,
      gender: student.gender, class_id: student.class_id, parent_phone: student.parent_phone,
      parent_zalo: student.parent_zalo || "", address: student.address || "",
    });
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (studentId) => {
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
    if (confirm("Bạn có chắc chắn muốn xóa học sinh này? Thao tác này sẽ xóa cả các vi phạm liên quan.")) {
        setStudents(students.filter(s => s.id !== studentId));
        setViolations(violations.filter(v => v.student_id !== studentId));
        alert("Xóa học sinh thành công!");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "giaovien" && password === "123456") {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setUsername("");
      setPassword("");
    } else {
      alert("Tài khoản hoặc mật khẩu không đúng!");
    }
  };
  
  const handleDownloadTemplate = () => {
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
    const headers = 'student_code,full_name,date_of_birth,gender,class_name,parent_phone,parent_zalo,address';
    const blob = new Blob(['\uFEFF' + headers], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_import_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStudents = () => {
      if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
      if (filteredStudents.length === 0) return alert("Không có dữ liệu học sinh để xuất.");
      const headers = ['Mã học sinh', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Lớp', 'Điểm hạnh kiểm', 'SĐT phụ huynh', 'Zalo phụ huynh', 'Địa chỉ'];
      const dataToExport = filteredStudents.map(s => [
          s.student_code, s.full_name, s.date_of_birth, s.gender, s.class_name,
          calculateConductScore(s), s.parent_phone, s.parent_zalo || '', s.address || ''
      ]);
      const csvContent = [headers.join(','), ...dataToExport.map(row => row.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const fileName = `danh_sach_hoc_sinh_${new Date().toISOString().slice(0,10)}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleAttendanceChange = (studentId: number, field: keyof AttendanceRecord, value: any) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    setAttendanceRecords(prev => {
        const currentRecordsForDate = prev[dateStr] || {};
        const studentRecord = currentRecordsForDate[studentId] || getInitialAttendanceRecord();
        return { ...prev, [dateStr]: { ...currentRecordsForDate, [studentId]: { ...studentRecord, [field]: value } } };
    });
  };

  const handleUpdateAttendance = () => {
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để thực hiện thao tác này!");
    const dateKey = selectedDate.toISOString().split('T')[0];
    const todaysRecords = attendanceRecords[dateKey] || {};
    const studentIdsMarkedAbsent = Object.entries(todaysRecords)
        .filter(([, record]) => record.status === 'Vắng mặt')
        .map(([studentId]) => parseInt(studentId));
    setAbsences(prevAbsences => {
        const otherDaysAbsences = prevAbsences.filter(a => new Date(a.date).toISOString().split('T')[0] !== dateKey);
        const newAbsencesForDate = studentIdsMarkedAbsent.map(studentId => ({ student_id: studentId, date: selectedDate.toISOString() }));
        return [...otherDaysAbsences, ...newAbsencesForDate];
    });
    alert('Cập nhật điểm danh thành công! Dữ liệu trên Dashboard đã được đồng bộ.');
  };

  const menuItems = [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard", color: "#4f46e5" },
    { id: "students", icon: "fas fa-user-graduate", label: "Quản lý học sinh", color: "#059669" },
    { id: "attendance", icon: "fas fa-calendar-check", label: "Điểm danh", color: "#0891b2" },
    { id: "violations", icon: "fas fa-exclamation-triangle", label: "Vi phạm", color: "#ea580c" },
    { id: "rewards", icon: "fas fa-trophy", label: "Khen thưởng", color: "#d97706" },
    { id: "reports", icon: "fas fa-chart-line", label: "Báo cáo", color: "#7c3aed" },
    { id: "notifications", icon: "fas fa-bell", label: "Thông báo", color: "#dc2626" },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div 
        className="rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1" 
        style={{ background: `radial-gradient(circle at 90% 50%, ${color}1A 0%, white 50%)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold my-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        </div>
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" 
          style={{ background: color, boxShadow: `0 8px 16px -4px ${color}99` }}
        >
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
    </div>
  );

  const dailyViolatingStudentIds = new Set(dailyViolations.map(v => v.student_id));
  const weeklyViolatingStudentIds = new Set(weeklyViolations.map(v => v.student_id));

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += `${context.raw} học sinh`;
            return label;
          }
        }
      }
    },
  };

  const dailyChartData = {
    labels: ['Học sinh vi phạm', 'Học sinh không vi phạm'],
    datasets: [{
      data: [dailyViolatingStudentIds.size, stats.totalStudents - dailyViolatingStudentIds.size],
      backgroundColor: ['#ef4444', '#22c55e'], borderColor: ['#f8fafc', '#f8fafc'], borderWidth: 2,
    }],
  };
  
  const weeklyChartData = {
    labels: ['Học sinh vi phạm', 'Học sinh không vi phạm'],
    datasets: [{
      data: [weeklyViolatingStudentIds.size, stats.totalStudents - weeklyViolatingStudentIds.size],
      backgroundColor: ['#f97316', '#22c55e'], borderColor: ['#f8fafc', '#f8fafc'], borderWidth: 2,
    }],
  };
  
  const getConductClassification = (score) => {
    if (score >= 90) return { text: "Tốt", className: "bg-green-100 text-green-800" };
    if (score >= 80) return { text: "Khá", className: "bg-yellow-100 text-yellow-800" };
    if (score >= 70) return { text: "Trung bình", className: "bg-orange-100 text-orange-800" };
    return { text: "Yếu", className: "bg-red-100 text-red-800" };
  };

  const StudentCard = ({ student, onEdit, onDelete }) => {
    const calculatedScore = calculateConductScore(student);
    const classification = getConductClassification(calculatedScore);
    const scoreColor = calculatedScore >= 90 ? 'text-green-500' : calculatedScore >= 80 ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col">
        <div className="flex items-start justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-blue-50 flex-shrink-0">
              <i className="fas fa-user-friends text-3xl text-blue-400"></i>
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-800">{student.full_name}</h4>
              <p className="text-sm text-gray-500">{student.student_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(student)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 w-8 h-8 rounded-md flex items-center justify-center transition-colors">
              <i className="fas fa-edit"></i>
            </button>
            <button onClick={() => onDelete(student.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-md flex items-center justify-center transition-colors">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div className="pt-4 space-y-2 flex-grow border-t border-gray-100">
          <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Lớp:</span><span className="font-semibold text-gray-800">{student.class_name}</span></div>
          <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Giới tính:</span><span className="font-semibold text-gray-800">{student.gender}</span></div>
          <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Điểm hạnh kiểm:</span><span className={`font-bold text-base ${scoreColor}`}>{calculatedScore}</span></div>
          <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Xếp loại:</span><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${classification.className}`}>{classification.text}</span></div>
          <div className="flex justify-between items-center text-sm"><span className="text-gray-500">SĐT phụ huynh:</span><span className="font-semibold text-gray-800">{student.parent_phone}</span></div>
        </div>
      </div>
    );
  };
  
  const ViolationCard = ({ violation, onEdit, onDelete }) => {
    const student = violation.student;
    if (!student) return null; 

    const levelTag = violation.severity_level === 'Nặng' ? 'bg-red-100 text-red-800' 
        : violation.severity_level === 'Trung bình' ? 'bg-orange-100 text-orange-800'
        : 'bg-yellow-100 text-yellow-800';
    const statusTag = violation.status === 'Đã giải quyết' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-xl text-red-400"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-base text-gray-800">{student.full_name}</h4>
                        <p className="text-sm text-gray-500">{student.student_code}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs font-medium">
                    <span className={`px-2 py-1 rounded-full ${levelTag}`}>{violation.severity_level}</span>
                    <span className={`px-2 py-1 rounded-full ${statusTag}`}>{violation.status}</span>
                </div>
            </div>

            <div className="space-y-3 mb-4 flex-grow">
                <h5 className="font-bold text-gray-800 text-md">{Array.isArray(violation.violation_type) ? violation.violation_type.join(', ') : violation.violation_type}</h5>
                {violation.description && <p className="text-sm text-gray-600 italic">"{violation.description}"</p>}
                
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Điểm trừ:</span><span className="font-semibold text-red-500">{violation.points_deducted ? `- ${violation.points_deducted}` : '-'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ngày vi phạm:</span><span className="font-semibold text-gray-700">{new Date(violation.violation_date).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Vi phạm lần thứ:</span><span className="font-semibold text-red-500">{violation.violation_count || 1}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Báo cáo bởi:</span><span className="font-semibold text-gray-700">{violation.reported_by}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Giải quyết:</span><span className={`font-semibold ${violation.resolved_date ? 'text-green-600' : 'text-gray-500'}`}>{violation.resolved_date ? new Date(violation.resolved_date).toLocaleDateString('vi-VN') : '-'}</span></div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(violation)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 w-8 h-8 rounded-md flex items-center justify-center transition-colors">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => onDelete(violation)} className="text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-md flex items-center justify-center transition-colors">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  PHẦN MỀM QUẢN LÝ NỀ NẾP HỌC SINH
                </h1>
                <p className="text-sm text-gray-600">Lớp 12 Chuyên Tin</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isAuthenticated) { setIsAuthenticated(false); alert("Đã đăng xuất."); } 
                else { setShowLoginModal(true); }
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <i className={`fas ${isAuthenticated ? 'fa-sign-out-alt' : 'fa-sign-in-alt'}`}></i>
              <span>{isAuthenticated ? "Đăng xuất" : "Đăng nhập"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        <aside className="w-64 bg-white shadow-lg sticky top-[85px] border-r border-gray-200">
          <div className="p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-md ${ currentView === item.id ? "shadow-lg" : "hover:bg-gray-50" }`}
                  style={{
                    background: currentView === item.id ? `linear-gradient(135deg, ${item.color}15, ${item.color}25)` : "transparent",
                    borderLeft: currentView === item.id ? `4px solid ${item.color}` : "4px solid transparent",
                  }}
                >
                  <i className={`${item.icon} text-lg w-6 text-center`} style={{ color: currentView === item.id ? item.color : "#6b7280" }}></i>
                  <span className={`font-medium ${ currentView === item.id ? "font-semibold" : "text-gray-700" }`} style={{ color: currentView === item.id ? item.color : "#374151" }} >
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {currentView === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng trở lại! 👋</h2>
                <p className="text-gray-600">{formattedDate}</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard title="Tổng số học sinh" value={stats.totalStudents} icon="fas fa-users" color="#4f46e5" subtitle="Đang theo học" />
                    <StatCard title="Lượt vi phạm hôm nay" value={stats.dailyViolationsCount} icon="fas fa-exclamation-triangle" color="#dc2626" subtitle="Cần xử lý" />
                    <StatCard title="Lượt vi phạm tuần" value={weeklyViolations.length} icon="fas fa-calendar-alt" color="#ea580c" subtitle="Trong 7 ngày qua" />
                    <StatCard title="Học sinh có mặt" value={stats.dailyAttendance} icon="fas fa-calendar-check" color="#059669" subtitle="Hôm nay" />
                    <StatCard title="Học sinh vắng mặt" value={stats.dailyAbsentees} icon="fas fa-user-slash" color="#ef4444" subtitle="Hôm nay" />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Charts */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-chart-pie text-red-500 mr-2"></i>Tỉ lệ vi phạm trong ngày</h3>
                            <div className="h-64 flex items-center justify-center">{dailyViolatingStudentIds.size > 0 ? (<Pie data={dailyChartData} options={chartOptions} />) : (<div className="text-center"><i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có học sinh vi phạm hôm nay!</p></div>)}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-chart-bar text-orange-500 mr-2"></i>Tỉ lệ vi phạm trong tuần</h3>
                          <div className="h-64 flex items-center justify-center">{weeklyViolatingStudentIds.size > 0 ? (<Pie data={weeklyChartData} options={chartOptions} />) : (<div className="text-center"><i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có học sinh vi phạm trong tuần!</p></div>)}</div>
                        </div>
                    </div>

                    {/* Column 2: Violation Lists */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-calendar-day text-red-500 mr-2"></i>Học sinh vi phạm trong ngày</h3>
                            <div className="space-y-3 h-64 overflow-y-auto pr-2">{dailyViolations.length > 0 ? (dailyViolations.map((violation) => (<div key={violation.id} className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-400 hover:bg-red-100 transition-colors duration-200"><div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0"><i className="fas fa-user-times text-white text-sm"></i></div><div className="flex-1"><p className="font-medium text-gray-800">{students.find(s => s.id === violation.student_id)?.full_name || 'Học sinh không xác định'}</p><p className="text-sm text-gray-600">{Array.isArray(violation.violation_type) ? violation.violation_type.join(', ') : violation.violation_type}</p></div><span className="text-xs text-gray-500">{new Date(violation.violation_date).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span></div>))) : (<div className="text-center flex flex-col items-center justify-center h-full"><i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có vi phạm nào hôm nay!</p></div>)}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-calendar-week text-orange-500 mr-2"></i>Học sinh vi phạm trong tuần</h3>
                            <div className="space-y-3 h-64 overflow-y-auto pr-2">{weeklyViolations.length > 0 ? (weeklyViolations.map((violation) => (<div key={violation.id} className="flex items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400 hover:bg-orange-100 transition-colors duration-200"><div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0"><i className="fas fa-user-times text-white text-sm"></i></div><div className="flex-1"><p className="font-medium text-gray-800">{students.find(s => s.id === violation.student_id)?.full_name || 'Học sinh không xác định'}</p><p className="text-sm text-gray-600">{Array.isArray(violation.violation_type) ? violation.violation_type.join(', ') : violation.violation_type}</p></div><span className="text-xs text-gray-500">{new Date(violation.violation_date).toLocaleDateString("vi-VN")}</span></div>))) : (<div className="text-center flex flex-col items-center justify-center h-full"><i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có vi phạm nào trong tuần!</p></div>)}</div>
                        </div>
                    </div>

                    {/* Column 3: Absence Lists */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-user-slash text-blue-500 mr-2"></i>Học sinh vắng trong ngày</h3>
                            <div className="space-y-3 h-64 overflow-y-auto pr-2">{dailyAbsenceDetails.length > 0 ? (dailyAbsenceDetails.map((absence) => (<div key={`daily-abs-${absence.student_id}`} className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 hover:bg-blue-100 transition-colors duration-200"><div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0"><i className="fas fa-user-check text-white text-sm"></i></div><div className="flex-1"><p className="font-medium text-gray-800">{students.find(s => s.id === absence.student_id)?.full_name || 'Học sinh không xác định'}</p><p className="text-sm text-gray-600">Lớp: {students.find(s => s.id === absence.student_id)?.class_name || 'N/A'}</p></div></div>))) : (<div className="text-center flex flex-col items-center justify-center h-full"><i className="fas fa-calendar-check text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có học sinh nào vắng hôm nay!</p></div>)}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><i className="fas fa-calendar-times text-purple-500 mr-2"></i>Học sinh vắng trong tuần</h3>
                            <div className="space-y-3 h-64 overflow-y-auto pr-2">{weeklyAbsenceDetails.length > 0 ? (weeklyAbsenceDetails.map((absence) => (<div key={`weekly-abs-${absence.student_id}-${absence.date}`} className="flex items-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400 hover:bg-purple-100 transition-colors duration-200"><div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0"><i className="fas fa-user-check text-white text-sm"></i></div><div className="flex-1"><p className="font-medium text-gray-800">{students.find(s => s.id === absence.student_id)?.full_name || 'Học sinh không xác định'}</p><p className="text-sm text-gray-600">Lớp: {students.find(s => s.id === absence.student_id)?.class_name || 'N/A'}</p></div><span className="text-xs text-gray-500">{new Date(absence.date).toLocaleDateString("vi-VN")}</span></div>))) : (<div className="text-center flex flex-col items-center justify-center h-full"><i className="fas fa-calendar-check text-4xl text-green-400 mb-2"></i><p className="text-gray-600">Không có học sinh nào vắng trong tuần!</p></div>)}</div>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentView === "students" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-3 border bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" placeholder="Tìm kiếm học sinh..." />
                      <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full sm:w-auto px-4 py-3 border bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"><option value="">Tất cả lớp</option>{classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}</select>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => { if (isAuthenticated) { setImportFile(null); setImportResults(null); setShowImportModal(true); } else alert("Vui lòng đăng nhập để thực hiện thao tác này!"); }} className="flex items-center justify-center px-4 py-2 rounded-lg bg-[#1db954] text-white font-semibold shadow hover:bg-green-600 transition"><i className="fas fa-file-csv mr-2"></i><span>Thêm từ CSV</span></button>
                      <button onClick={handleDownloadTemplate} className="flex items-center justify-center px-4 py-2 rounded-lg bg-fuchsia-500 text-white font-semibold shadow hover:bg-fuchsia-600 transition"><i className="fas fa-file-alt mr-2"></i><span>Tạo file mẫu</span></button>
                      <button onClick={handleExportStudents} className="flex items-center justify-center px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"><i className="fas fa-download mr-2"></i><span>Xuất danh sách</span></button>
                      <button onClick={() => { if (isAuthenticated) { setEditingStudent(null); setStudentForm({student_code: "",full_name: "",date_of_birth: "",gender: "Nam",class_id: "",parent_phone: "",parent_zalo: "",address: ""}); setShowStudentModal(true); } else alert("Vui lòng đăng nhập để thực hiện thao tác này!"); }} className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold shadow hover:shadow-lg transition"><i className="fas fa-plus mr-2"></i><span>Thêm học sinh</span></button>
                  </div>
              </div>

              {filteredStudents.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredStudents.map((student) => (<StudentCard key={student.id} student={student} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />))}</div>) : (<div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"><i className="fas fa-users text-5xl text-gray-300 mb-4"></i><h3 className="text-xl font-semibold text-gray-600">Không tìm thấy học sinh</h3><p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p></div>)}
            </div>
          )}

          {currentView === "attendance" && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative"><input type="text" value={selectedDate.toLocaleDateString('vi-VN')} readOnly className="w-40 px-4 py-3 border bg-white border-gray-200 rounded-lg shadow-sm" /><i className="fas fa-calendar absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i><input type="date" value={selectedDate.toISOString().split('T')[0]} onChange={e => { const dateValue = e.target.value; if(dateValue) { setSelectedDate(new Date(dateValue + 'T00:00:00')); } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /></div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 px-4 py-3 border bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" placeholder="Tìm kiếm học sinh..." />
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full sm:w-auto px-4 py-3 border bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"><option value="">Tất cả lớp</option>{classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}</select>
                    <button onClick={handleUpdateAttendance} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"><i className="fas fa-save"></i><span>Cập nhật</span></button>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm"><thead className="bg-gradient-to-b from-green-50 to-white/50"><tr><th className="p-4 text-center font-semibold text-gray-600 w-[250px]">Học sinh</th><th className="p-4 text-center font-semibold text-gray-600">Điểm danh</th><th className="p-4 text-center font-semibold text-gray-600">Thái độ học tập</th><th className="p-4 text-center font-semibold text-gray-600">HĐ ngoại khóa</th><th className="p-4 text-center font-semibold text-gray-600 w-[180px]">Ghi chú</th></tr></thead>
                        <tbody>{filteredStudents.map(student => { const dateKey = selectedDate.toISOString().split('T')[0]; const record = attendanceRecords[dateKey]?.[student.id] || getInitialAttendanceRecord(); const renderStarRating = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating); return (<tr key={student.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"><td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-50 flex-shrink-0"><i className="fas fa-user text-lg text-cyan-500"></i></div><div><p className="font-bold text-gray-800">{student.full_name}</p><p className="text-xs text-gray-500">{student.student_code} - {student.class_name}</p></div></div></td><td><select value={record.status} onChange={e => handleAttendanceChange(student.id, 'status', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"><option>Có mặt</option><option>Vắng mặt</option><option>Muộn</option></select></td><td><select value={record.attitude} onChange={e => handleAttendanceChange(student.id, 'attitude', parseInt(e.target.value))} className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500">{[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{renderStarRating(r)}</option>)}</select></td><td className="text-center"><button onClick={() => handleAttendanceChange(student.id, 'extracurricular', !record.extracurricular)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 mx-auto ${record.extracurricular ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}><i className="fas fa-check"></i></button></td><td><input type="text" placeholder="Ghi chú..." value={record.notes} onChange={e => handleAttendanceChange(student.id, 'notes', e.target.value)} className="w-full bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td></tr>)})}</tbody>
                    </table>
                </div>
            </div>
          )}
          
          {currentView === "violations" && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
                        <input type="text" value={violationSearchTerm} onChange={(e) => setViolationSearchTerm(e.target.value)} className="w-full sm:w-auto flex-grow px-4 py-2 border bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" placeholder="Tìm kiếm vi phạm..." />
                        <select value={violationSelectedClass} onChange={(e) => setViolationSelectedClass(e.target.value)} className="w-full sm:w-auto px-4 py-2 border bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"><option value="">Tất cả lớp</option>{classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}</select>
                        <select value={violationSeverityFilter} onChange={(e) => setViolationSeverityFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 border bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"><option value="">Mọi mức độ</option><option value="Nhẹ">Nhẹ</option><option value="Trung bình">Trung bình</option><option value="Nặng">Nặng</option></select>
                        <select value={violationStatusFilter} onChange={(e) => setViolationStatusFilter(e.target.value)} className="w-full sm:w-auto px-4 py-2 border bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"><option value="">Mọi trạng thái</option><option value="Đã giải quyết">Đã giải quyết</option><option value="Chưa giải quyết">Chưa giải quyết</option></select>
                    </div>
                    <button onClick={handleOpenAddViolationModal} className="flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-orange-600 transition-all transform hover:-translate-y-0.5">
                        <i className="fas fa-plus mr-2"></i><span>Thêm vi phạm</span>
                    </button>
                </div>

                {filteredViolations.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredViolations.map((v) => (
                            <ViolationCard key={v.id} violation={v} onEdit={handleOpenEditViolationModal} onDelete={handleDeleteViolation} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <i className="fas fa-shield-alt text-5xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-600">Không tìm thấy vi phạm</h3>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                    </div>
                )}
            </div>
          )}

          {currentView !== "dashboard" && currentView !== "students" && currentView !== "attendance" && currentView !== "violations" && (
            <div className="text-center py-16 animate-fade-in">
              <i className="fas fa-cogs text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">Tính năng đang phát triển</h3>
              <p className="text-gray-500">Chức năng "{menuItems.find((item) => item.id === currentView)?.label}" sẽ được cập nhật sớm</p>
            </div>
          )}
        </main>
      </div>

      {showLoginModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in"><div className="text-center mb-6"><div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><i className="fas fa-lock text-white text-xl"></i></div><h3 className="text-2xl font-bold text-gray-800">Đăng nhập giáo viên</h3><p className="text-gray-600 mt-2">Để cập nhật dữ liệu học sinh</p></div><form onSubmit={handleLogin} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Tài khoản</label><input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Nhập tài khoản" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label><input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Nhập mật khẩu" required /></div><div className="flex space-x-3 pt-4"><button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">Hủy</button><button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">Đăng nhập</button></div><div className="mt-6 p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-600"><i className="fas fa-info-circle mr-1"></i>Tài khoản demo: <strong>giaovien</strong> / Mật khẩu: <strong>123456</strong></p></div></form></div></div>)}
      {showStudentModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"><div className="text-center mb-6"><div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><i className="fas fa-user-graduate text-white text-xl"></i></div><h3 className="text-2xl font-bold text-gray-800">{editingStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}</h3><p className="text-gray-600 mt-2">Nhập đầy đủ thông tin học sinh</p></div><form onSubmit={handleSaveStudent} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Mã học sinh *</label><input type="text" name="student_code" value={studentForm.student_code} onChange={(e) => setStudentForm({ ...studentForm, student_code: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="VD: CT2024001" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label><input type="text" name="full_name" value={studentForm.full_name} onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập họ và tên" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label><input type="date" name="date_of_birth" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label><select name="gender" value={studentForm.gender} onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Lớp học *</label><select name="class_id" value={studentForm.class_id} onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required><option value="">Chọn lớp học</option>{classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-2">SĐT phụ huynh *</label><input type="tel" name="parent_phone" value={studentForm.parent_phone} onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="0987654321" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Zalo phụ huynh</label><input type="tel" name="parent_zalo" value={studentForm.parent_zalo} onChange={(e) => setStudentForm({ ...studentForm, parent_zalo: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="0987654321" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label><textarea name="address" value={studentForm.address} onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Nhập địa chỉ đầy đủ" rows={3}/></div><div className="flex space-x-3 pt-6"><button type="button" onClick={() => { setShowStudentModal(false); setEditingStudent(null); }} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button><button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700">{editingStudent ? "Cập nhật" : "Thêm học sinh"}</button></div></form></div></div>)}
      {showImportModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"><div className="text-center mb-6"><div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><i className="fas fa-file-import text-white text-xl"></i></div><h3 className="text-2xl font-bold text-gray-800">Import danh sách học sinh</h3><p className="text-gray-600 mt-2">Tải lên file CSV để import học sinh hàng loạt</p></div><div className="space-y-6"><div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i><p className="text-gray-600 mb-4">Kéo và thả file hoặc</p><input type="file" accept=".csv" onChange={(e) => { setImportFile(e.target.files[0]); setImportResults(null); }} className="hidden" id="import-file" /><label htmlFor="import-file" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition-all duration-200 inline-block shadow-md">Chọn file</label>{importFile && (<p className="text-sm text-green-600 mt-3 font-medium">Đã chọn: {importFile.name}</p>)}</div><div className="bg-blue-50 p-4 rounded-lg border border-blue-200"><h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn:</h4><ul className="text-sm text-blue-700 space-y-1 list-disc list-inside"><li>File phải có định dạng CSV (.csv)</li><li>Dòng đầu tiên phải chứa tên các cột theo file mẫu.</li><li>Các cột bắt buộc: <code className="text-xs bg-blue-100 p-1 rounded">student_code</code>, <code className="text-xs bg-blue-100 p-1 rounded">full_name</code>, <code className="text-xs bg-blue-100 p-1 rounded">date_of_birth</code>, <code className="text-xs bg-blue-100 p-1 rounded">gender</code>, <code className="text-xs bg-blue-100 p-1 rounded">class_name</code>, <code className="text-xs bg-blue-100 p-1 rounded">parent_phone</code></li></ul></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><h4 className="font-semibold text-gray-800 mb-2">Kết quả import:</h4><div className="text-sm space-y-1"><p>Tổng số dòng trong file: <span className="font-bold">{importResults?.total ?? 0}</span></p><p className="text-green-600">Thành công: <span className="font-bold">{importResults?.success ?? 0}</span></p><p className="text-red-600">Lỗi: <span className="font-bold">{importResults?.errors ?? 0}</span></p></div>{importResults?.details?.length > 0 && (<div className="mt-4 pt-2 border-t max-h-40 overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-gray-200 z-10"><tr><th className="p-2 text-left font-semibold">Dòng</th><th className="p-2 text-left font-semibold">Mã HS</th><th className="p-2 text-left font-semibold">Trạng thái</th><th className="p-2 text-left font-semibold">Chi tiết</th></tr></thead><tbody>{importResults.details.map((detail, index) => (<tr key={index} className={`border-b border-gray-100 last:border-b-0 ${detail.status === 'Error' ? 'bg-red-50' : 'bg-green-50'}`}><td className="p-2 text-center font-mono">{detail.row}</td><td className="p-2 font-mono">{detail.student_code}</td><td className={`p-2 font-semibold ${detail.status === 'Error' ? 'text-red-700' : 'text-green-700'}`}>{detail.status === 'Error' ? 'Lỗi' : 'Thành công'}</td><td className="p-2 text-xs">{detail.error || 'Import thành công'}</td></tr>))}</tbody></table></div>)}</div><div className="flex space-x-3 pt-6"><button type="button" onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">Đóng</button><button type="button" onClick={handleImportStudents} disabled={!importFile || loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (<span className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang xử lý...</span>) : 'Bắt đầu Import' }</button></div></div></div></div>)}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingViolation ? "Sửa vi phạm" : "Thêm vi phạm mới"}</h3>
            <form onSubmit={handleSaveViolation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Học sinh *</label>
                  <select name="student_id" value={violationForm.student_id} onChange={(e) => setViolationForm({ ...violationForm, student_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
                    <option value="">Chọn học sinh</option>
                    {students.map((s) => (<option key={s.id} value={s.id}>{s.full_name} - {s.student_code}</option>))}
                  </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày vi phạm *</label>
                    <input type="date" name="violation_date" value={violationForm.violation_date} onChange={(e) => setViolationForm({ ...violationForm, violation_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại vi phạm *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {violationTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                value={type}
                                checked={violationForm.violation_type.includes(type)}
                                onChange={(e) => {
                                    const { checked, value } = e.target;
                                    setViolationForm(prev => ({
                                        ...prev,
                                        violation_type: checked
                                            ? [...prev.violation_type, value]
                                            : prev.violation_type.filter(t => t !== value)
                                    }));
                                }}
                                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span>{type}</span>
                        </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                <textarea name="description" value={violationForm.description} onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Mô tả thêm (nếu có)..." rows={3}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ nghiêm trọng *</label>
                    <select name="severity_level" value={violationForm.severity_level} onChange={(e) => setViolationForm({ ...violationForm, severity_level: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
                        <option value="Nhẹ">Nhẹ</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Nặng">Nặng</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Điểm trừ *</label>
                    <input type="number" name="points_deducted" value={violationForm.points_deducted} onChange={(e) => setViolationForm({ ...violationForm, points_deducted: e.target.valueAsNumber || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required min="0"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vi phạm lần thứ *</label>
                    <select name="violation_count" value={violationForm.violation_count} onChange={(e) => setViolationForm({ ...violationForm, violation_count: Number(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white" required>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Người báo cáo</label>
                <input type="text" name="reported_by" value={violationForm.reported_by} onChange={(e) => setViolationForm({ ...violationForm, reported_by: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="VD: tin12@gmail.com" />
              </div>
              
              <div className="flex space-x-3 pt-6">
                  <button type="button" onClick={() => setShowViolationModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600">{editingViolation ? "Cập nhật" : "Thêm mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MainComponent />
    </React.StrictMode>
  );
}
