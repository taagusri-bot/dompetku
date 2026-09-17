/**
 * DompetKu - Personal Financial & Cashflow Management
 * Versi V6:
 * - Menambahkan Fitur Tabungan (Tri-Wallet System: Rekening, Cash, Tabungan)
 * - Fitur Pengeluaran Mengambil dari Tabungan (langsung potong saldo Tabungan tanpa merusak kuota harian)
 * - Fitur Setor Menabung & Pindah Dana Antar Kantong
 * - Radar Ketahanan Sisa Hari (Cek kelayakan 50rb/hari setelah dikurangi semua utang)
 * - 6 Pos Utang Terdaftar (Pinjol 4x, Motor 2th, Kos, Teman 5bln, Teman pendek, Ortu)
 */

const STORAGE_KEY = 'DOMPET_PNS_DATA_V6';

function getDefaultData() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const d3Ago = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const d7Ago = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const d40Ago = new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const d22Ago = new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    profile: {
      dailyLimit: 50000,
      gajiPokokEst: 4000000,
      tukinEst: 2330000,
      uangMakanEst: 650000,
      gajiDate: 1,
      tukinDate: 15
    },

    pendingInflow: {
      tukinAmount: 2330000,
      tukinReceived: false,
      uangMakanAmount: 650000,
      uangMakanReceived: false
    },

    transactions: [
      {
        id: 'tx_init_rekening',
        date: todayStr,
        time: '07:00',
        type: 'income',
        category: 'saldo_awal',
        wallet: 'rekening',
        amount: 4000000,
        note: 'Saldo Awal Rekening Bank'
      },
      {
        id: 'tx_init_cash',
        date: todayStr,
        time: '07:00',
        type: 'income',
        category: 'saldo_awal',
        wallet: 'cash',
        amount: 365000,
        note: 'Saldo Awal Uang Cash / Dompet'
      }
    ],

    // Daftar 6 Komitmen Utang & Tagihan Rutin Pengguna
    debts: [
      {
        id: 'debt_kos',
        name: 'Biaya Kos Bulanan',
        monthlyAmount: 1000000,
        totalMonths: 12,
        startMonth: '2026-09',
        endMonth: '2027-12',
        targetPayDay: 15,
        deductFrom: 'tukin',
        paidMonths: ['2026-09'], // September 2026 SUDAH LUNAS
        isRecurringMonthly: true,
        note: 'Tiap terima Tukin (Bulan September sudah dibayar)'
      },
      {
        id: 'debt_teman_1jt',
        name: 'Utang Teman (5 Bulan)',
        monthlyAmount: 1000000,
        totalMonths: 5,
        startMonth: '2026-10',
        endMonth: '2027-02',
        targetPayDay: 15,
        deductFrom: 'tukin',
        paidMonths: [],
        note: 'Dibayar pas masuk Tukin (1 Jt / bulan)'
      },
      {
        id: 'debt_pinjol',
        name: 'Cicilan Pinjol (Sisa 4x)',
        monthlyAmount: 1370000,
        totalMonths: 4,
        startMonth: '2026-10',
        endMonth: '2027-01',
        targetPayDay: 1,
        deductFrom: 'gaji_pokok',
        paidMonths: [],
        note: 'Sisa 4x per tgl 1 mulai Oktober (Okt 2026 s/d Jan 2027)'
      },
      {
        id: 'debt_motor',
        name: 'Cicilan Motor (~2 Tahun)',
        monthlyAmount: 830000,
        totalMonths: 24,
        startMonth: '2026-10',
        endMonth: '2028-09',
        targetPayDay: 1,
        deductFrom: 'gaji_pokok',
        paidMonths: [],
        note: 'Dibayar setiap tgl 1 dari Gaji Pokok'
      },
      {
        id: 'debt_teman_pendek',
        name: 'Utang Teman (Jangka Pendek)',
        monthlyAmount: 500000,
        totalMonths: 1,
        startMonth: '2026-09',
        endMonth: '2026-09',
        targetPayDay: 15,
        deductFrom: 'tukin',
        paidMonths: [],
        isSinglePay: true,
        note: 'Sekali bayar pas cair Tukin'
      },
      {
        id: 'debt_ortu',
        name: 'Utang ke Orang Tua',
        monthlyAmount: 660000,
        totalMonths: 1,
        startMonth: '2026-09',
        endMonth: '2026-09',
        targetPayDay: 15,
        deductFrom: 'tukin',
        paidMonths: [],
        isSinglePay: true,
        note: 'Dibayar pas cair Tukin'
      }
    ],

    routineReminders: [
      {
        id: 'galon',
        name: 'Isi Galon Air',
        cycleDays: 3,
        estCost: 5000,
        lastDoneDate: d3Ago,
        category: 'pokok',
        wallet: 'cash',
        icon: 'droplet'
      },
      {
        id: 'bensin',
        name: 'Bensin Motor / Kendaraan',
        cycleDays: 10,
        estCost: 50000,
        lastDoneDate: d7Ago,
        category: 'pokok',
        wallet: 'cash',
        icon: 'fuel'
      },
      {
        id: 'oli',
        name: 'Ganti Oli Mesin',
        cycleDays: 60,
        estCost: 100000,
        lastDoneDate: d40Ago,
        category: 'pokok',
        wallet: 'cash',
        icon: 'wrench'
      },
      {
        id: 'rambut',
        name: 'Potong Rambut',
        cycleDays: 30,
        estCost: 35000,
        lastDoneDate: d22Ago,
        category: 'pokok',
        wallet: 'cash',
        icon: 'scissors'
      }
    ]
  };
}

function formatRupiah(number) {
  if (isNaN(number) || number === null || number === undefined) return 'Rp 0';
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parts[0];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${monthNames[m]} ${y}`;
}

const App = {
  data() {
    return {
      activeTab: 'dashboard',
      state: null,
      showQrModal: false,

      // Modal Input Transaksi Cepat
      showTxModal: false,
      txForm: {
        type: 'expense',
        wallet: 'cash', // 'cash', 'rekening', atau 'tabungan'
        amount: '',
        category: 'pokok',
        note: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      },

      // Modal Pindah Dana / Menabung / Tarik Tunai
      showTransferModal: false,
      transferForm: {
        from: 'rekening', // 'rekening', 'cash', 'tabungan'
        to: 'tabungan',   // 'tabungan', 'rekening', 'cash'
        amount: '',
        note: 'Menabung Dana Cadangan'
      },

      toast: {
        show: false,
        message: '',
        type: 'info'
      },

      statementFilterMonth: ''
    };
  },

  created() {
    this.loadState();
    const now = new Date();
    this.statementFilterMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  mounted() {
    this.initIcons();
    setTimeout(() => this.initIcons(), 300);
  },

  updated() {
    this.initIcons();
  },

  computed: {
    todayStr() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    currentMonthStr() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    currentPhase() {
      const day = new Date().getDate();
      if (day < 15) {
        return {
          id: 1,
          name: 'Fase 1 (Tgl 1 - 15)',
          source: 'Gaji Pokok',
          badgeColor: 'bg-emerald-500 text-white',
          desc: 'Pengaturan kebutuhan hidup dari Gaji Pokok',
          daysToNext: 15 - day,
          nextPaydayName: 'Tukin & Uang Makan (Tgl 15)',
          nextPaydayEst: this.pendingTotalEst
        };
      } else {
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const daysLeft = (lastDayOfMonth - day) + 1;
        return {
          id: 2,
          name: 'Fase 2 (Tgl 15 - Akhir Bulan)',
          source: 'Tukin & Uang Makan',
          badgeColor: 'bg-blue-600 text-white',
          desc: 'Pengaturan pengeluaran dari Tukin & Uang Makan',
          daysToNext: daysLeft,
          nextPaydayName: 'Gaji Pokok (Tgl 1 Depan)',
          nextPaydayEst: this.state.profile.gajiPokokEst
        };
      }
    },

    // Saldo Per Kantong (Tri-Wallet: Rekening, Cash, Tabungan)
    balanceRekening() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => (t.wallet || 'rekening') === 'rekening')
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
    },

    balanceCash() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.wallet === 'cash')
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
    },

    balanceTabungan() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.wallet === 'tabungan')
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount || 0) : -Number(t.amount || 0)), 0);
    },

    // Total Kas Operasional (Rekening + Cash)
    totalCash() {
      return this.balanceRekening + this.balanceCash;
    },

    // Total Seluruh Kekayaan (Kas Operasional + Tabungan)
    totalAllFunds() {
      return this.totalCash + this.balanceTabungan;
    },

    totalIncome() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    totalExpense() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    pendingTotalEst() {
      if (!this.state || !this.state.pendingInflow) return 2980000;
      let total = 0;
      if (!this.state.pendingInflow.tukinReceived) total += Number(this.state.pendingInflow.tukinAmount || 0);
      if (!this.state.pendingInflow.uangMakanReceived) total += Number(this.state.pendingInflow.uangMakanAmount || 0);
      return total;
    },

    tukinDebts() {
      if (!this.state || !this.state.debts) return [];
      return this.state.debts.filter(d => d.deductFrom === 'tukin');
    },

    gajiDebts() {
      if (!this.state || !this.state.debts) return [];
      return this.state.debts.filter(d => d.deductFrom === 'gaji_pokok');
    },

    totalTukinDebtObligation() {
      return this.tukinDebts.reduce((sum, d) => sum + Number(d.monthlyAmount || 0), 0);
    },

    sisaTukinBersih() {
      const masuk = Number(this.state.pendingInflow.tukinAmount) + Number(this.state.pendingInflow.uangMakanAmount);
      return masuk - this.totalTukinDebtObligation;
    },

    totalGajiDebtObligation() {
      return this.gajiDebts.reduce((sum, d) => sum + Number(d.monthlyAmount || 0), 0);
    },

    sisaGajiPokokBersih() {
      const gaji = Number(this.state.profile.gajiPokokEst || 4000000);
      return gaji - this.totalGajiDebtObligation;
    },

    // Total Utang Bulan Berjalan yang BELUM Lunas
    unpaidObligationsThisMonth() {
      if (!this.state || !this.state.debts) return 0;
      const currentMonth = this.currentMonthStr;
      let total = 0;
      this.state.debts.forEach(debt => {
        const isCurrent = (currentMonth >= debt.startMonth && currentMonth <= debt.endMonth) || debt.isSinglePay;
        if (isCurrent && (!debt.paidMonths || !debt.paidMonths.includes(currentMonth))) {
          total += Number(debt.monthlyAmount || 0);
        }
      });
      return total;
    },

    // Saldo Bersih Bebas Utang (Kas Operasional - Utang Bulan Ini)
    netSafeCash() {
      return this.totalCash - this.unpaidObligationsThisMonth;
    },

    daysInCurrentMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    },

    remainingDaysInMonth() {
      const now = new Date();
      const todayDate = now.getDate();
      const totalDays = this.daysInCurrentMonth;
      return Math.max(1, (totalDays - todayDate) + 1);
    },

    neededDailyBudgetTotal() {
      const limit = Number(this.state?.profile?.dailyLimit || 50000);
      return this.remainingDaysInMonth * limit;
    },

    safeDailyRatePossible() {
      if (this.remainingDaysInMonth <= 0) return 0;
      return Math.max(0, Math.floor(this.netSafeCash / this.remainingDaysInMonth));
    },

    runwayEvaluation() {
      const limit = Number(this.state?.profile?.dailyLimit || 50000);
      const net = this.netSafeCash;
      const needed = this.neededDailyBudgetTotal;
      const days = this.remainingDaysInMonth;
      const ratePossible = this.safeDailyRatePossible;

      if (net >= needed) {
        const surplus = net - needed;
        return {
          isSufficient: true,
          statusText: 'SANGAT CUKUP & AMAN',
          badgeClass: 'bg-emerald-500 text-white',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgGradient: 'from-emerald-950/70 via-slate-900 to-teal-950/60',
          icon: 'shield-check',
          surplusAmount: surplus,
          summary: `Saldo bersih Anda MENCUKUPI belanja Rp ${limit.toLocaleString('id-ID')}/hari untuk ${days} hari ke depan!`,
          detail: `Total kebutuhan sisa hari: ${formatRupiah(needed)}. Anda memiliki cadangan surplus ${formatRupiah(surplus)}. Jatah belanja maksimal yang aman adalah ${formatRupiah(ratePossible)}/hari.`
        };
      } else if (net > 0) {
        const deficit = needed - net;
        return {
          isSufficient: false,
          statusText: 'KURANG / PERLU HEMAT',
          badgeClass: 'bg-amber-500 text-white',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgGradient: 'from-amber-950/70 via-slate-900 to-slate-900',
          icon: 'alert-triangle',
          surplusAmount: -deficit,
          summary: `Perhatian: Saldo bersih tidak cukup untuk Rp ${limit.toLocaleString('id-ID')}/hari sampai akhir bulan!`,
          detail: `Kebutuhan ${days} hari adalah ${formatRupiah(needed)}, sedangkan saldo bersih Anda ${formatRupiah(net)} (defisit ${formatRupiah(deficit)}). Agar uang bertahan sampai akhir bulan, turunkan jatah belanja jadi maksimal ${formatRupiah(ratePossible)}/hari.`
        };
      } else {
        return {
          isSufficient: false,
          statusText: 'DEFISIT KRITIS',
          badgeClass: 'bg-red-600 text-white',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          bgGradient: 'from-red-950/80 via-slate-900 to-slate-900',
          icon: 'alert-octagon',
          surplusAmount: net,
          summary: `Peringatan: Saldo fisik kas tidak mencukupi untuk melunasi utang bulan ini!`,
          detail: `Kewajiban utang bulan ini (${formatRupiah(this.unpaidObligationsThisMonth)}) melebihi kas operasional Anda (${formatRupiah(this.totalCash)}).`
        };
      }
    },

    // Belanja Harian (HANYA dari Kas Operasional: Cash & Rekening; Pengeluaran dari Tabungan TIDAK memotong kuota harian!)
    todayExpenses() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.type === 'expense' && t.date === this.todayStr && t.wallet !== 'tabungan')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    // Total Belanja Hari Ini yang Diambil dari Tabungan
    todayTabunganExpenses() {
      if (!this.state || !this.state.transactions) return 0;
      return this.state.transactions
        .filter(t => t.type === 'expense' && t.date === this.todayStr && t.wallet === 'tabungan')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    },

    todayRemainingLimit() {
      return this.state.profile.dailyLimit - this.todayExpenses;
    },

    todayBudgetPercent() {
      const limit = this.state.profile.dailyLimit;
      if (!limit || limit <= 0) return 0;
      return Math.round((this.todayExpenses / limit) * 100);
    },

    todayBudgetStatus() {
      const limit = this.state.profile.dailyLimit;
      const spent = this.todayExpenses;
      if (spent > limit) {
        return {
          code: 'danger',
          label: 'OVER BUDGET!',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-300',
          barColor: 'bg-red-600',
          icon: 'alert-triangle',
          message: `Belanja hari ini melewati batas! Melebihi kuota sebesar ${formatRupiah(spent - limit)}.`
        };
      } else if (spent >= limit * 0.8) {
        return {
          code: 'warning',
          label: 'HATI-HATI (Mendekati Batas)',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-300',
          barColor: 'bg-amber-500',
          icon: 'alert-circle',
          message: `Pengeluaran sudah mencapai ${this.todayBudgetPercent}% kuota harian. Sisa jatah: ${formatRupiah(this.todayRemainingLimit)}.`
        };
      } else {
        return {
          code: 'safe',
          label: 'DALAM BATAS AMAN',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 border-emerald-300',
          barColor: 'bg-emerald-500',
          icon: 'check-circle-2',
          message: `Bagus! Pengeluaran hari ini aman. Sisa jatah belanja: ${formatRupiah(this.todayRemainingLimit)}.`
        };
      }
    },

    monthAnalytics() {
      if (!this.state || !this.state.transactions) {
        return { pokok: 0, jajan: 0, cicilan: 0, extraIncome: 0, fromTabungan: 0, totalExpenseMonth: 0, pokokPct: 0, jajanPct: 0 };
      }
      const thisMonthTxs = this.state.transactions.filter(t => t.date.startsWith(this.currentMonthStr));
      
      let pokok = 0;
      let jajan = 0;
      let cicilan = 0;
      let fromTabungan = 0;
      let extraIncome = 0;

      thisMonthTxs.forEach(t => {
        const amt = Number(t.amount || 0);
        if (t.type === 'expense') {
          if (t.wallet === 'tabungan') fromTabungan += amt;
          if (t.category === 'pokok') pokok += amt;
          else if (t.category === 'jajan') jajan += amt;
          else if (t.category === 'cicilan') cicilan += amt;
        } else if (t.type === 'income') {
          if (t.category === 'tak_terduga') extraIncome += amt;
        }
      });

      const totalExpenseMonth = pokok + jajan + cicilan;
      const pokokPct = totalExpenseMonth > 0 ? Math.round((pokok / totalExpenseMonth) * 100) : 0;
      const jajanPct = totalExpenseMonth > 0 ? Math.round((jajan / totalExpenseMonth) * 100) : 0;

      return {
        pokok,
        jajan,
        cicilan,
        fromTabungan,
        extraIncome,
        totalExpenseMonth,
        pokokPct,
        jajanPct
      };
    },

    calculatedRoutines() {
      if (!this.state || !this.state.routineReminders) return [];
      const today = new Date(this.todayStr);

      return this.state.routineReminders.map(item => {
        const lastDate = new Date(item.lastDoneDate || this.todayStr);
        const diffMs = today.getTime() - lastDate.getTime();
        const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const daysLeft = item.cycleDays - daysElapsed;

        let status = 'normal';
        let statusLabel = `Tersisa ${daysLeft} hari lagi`;
        let badgeClass = 'bg-slate-100 text-slate-700';

        if (daysLeft <= 0) {
          status = 'due';
          statusLabel = daysLeft === 0 ? 'Waktunya Hari Ini!' : `Terlambat ${Math.abs(daysLeft)} hari!`;
          badgeClass = 'bg-red-500 text-white font-bold urgent-reminder';
        } else if (daysLeft === 1) {
          status = 'tomorrow';
          statusLabel = 'Waktunya Besok!';
          badgeClass = 'bg-amber-500 text-white font-bold';
        }

        return {
          ...item,
          daysElapsed,
          daysLeft,
          status,
          statusLabel,
          badgeClass
        };
      });
    },

    dayByDayStatement() {
      if (!this.state || !this.state.transactions) return [];

      const sortedTxs = [...this.state.transactions].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || '');
      });

      const daysMap = {};
      let runningBalance = 0;

      sortedTxs.forEach(t => {
        const d = t.date;
        if (!daysMap[d]) {
          daysMap[d] = {
            date: d,
            startBalance: runningBalance,
            incomeGaji: 0,
            incomeExtra: 0,
            totalIncome: 0,
            expensePokok: 0,
            expenseJajan: 0,
            expenseCicilan: 0,
            expenseTabungan: 0,
            totalExpense: 0,
            endBalance: runningBalance,
            txCount: 0
          };
        }

        const amt = Number(t.amount || 0);
        daysMap[d].txCount++;

        if (t.type === 'income') {
          if (t.category === 'tak_terduga') {
            daysMap[d].incomeExtra += amt;
          } else {
            daysMap[d].incomeGaji += amt;
          }
          daysMap[d].totalIncome += amt;
          runningBalance += amt;
        } else {
          if (t.wallet === 'tabungan') {
            daysMap[d].expenseTabungan += amt;
          }
          if (t.category === 'pokok') {
            daysMap[d].expensePokok += amt;
          } else if (t.category === 'jajan') {
            daysMap[d].expenseJajan += amt;
          } else if (t.category === 'cicilan') {
            daysMap[d].expenseCicilan += amt;
          }
          daysMap[d].totalExpense += amt;
          runningBalance -= amt;
        }

        daysMap[d].endBalance = runningBalance;
      });

      let results = Object.values(daysMap);
      if (this.statementFilterMonth) {
        results = results.filter(row => row.date.startsWith(this.statementFilterMonth));
      }

      return results.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  methods: {
    formatRupiah(val) {
      return formatRupiah(val);
    },

    formatDateIndo(dateStr) {
      return formatDateIndo(dateStr);
    },

    getWalletName(w) {
      if (w === 'tabungan') return 'Tabungan';
      if (w === 'cash') return 'Dompet Cash';
      return 'Rekening Bank';
    },

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.state = JSON.parse(raw);
        } else {
          this.state = getDefaultData();
          this.saveState();
        }
      } catch (e) {
        console.error('Error loading state:', e);
        this.state = getDefaultData();
      }
    },

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Error saving state:', e);
      }
    },

    showToast(message, type = 'info') {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      setTimeout(() => {
        this.toast.show = false;
      }, 3500);
    },

    initIcons() {
      this.$nextTick(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    },

    claimTukin() {
      if (this.state.pendingInflow.tukinReceived) {
        alert('Tukin bulan ini sudah dicairkan ke rekening!');
        return;
      }

      const amt = Number(this.state.pendingInflow.tukinAmount);
      const newTx = {
        id: 'tx_tukin_' + Date.now(),
        date: this.todayStr,
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: 'income',
        category: 'tukin',
        wallet: 'rekening',
        amount: amt,
        note: 'Pencairan Tukin (Tunjangan Kinerja)'
      };

      this.state.transactions.unshift(newTx);
      this.state.pendingInflow.tukinReceived = true;
      this.saveState();
      this.showToast(`🎉 Tukin sebesar ${formatRupiah(amt)} berhasil masuk ke Rekening Bank!`, 'success');
    },

    claimUangMakan() {
      if (this.state.pendingInflow.uangMakanReceived) {
        alert('Uang Makan bulan ini sudah dicairkan ke rekening!');
        return;
      }

      const amt = Number(this.state.pendingInflow.uangMakanAmount);
      const newTx = {
        id: 'tx_makan_' + Date.now(),
        date: this.todayStr,
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: 'income',
        category: 'tukin',
        wallet: 'rekening',
        amount: amt,
        note: 'Pencairan Uang Makan'
      };

      this.state.transactions.unshift(newTx);
      this.state.pendingInflow.uangMakanReceived = true;
      this.saveState();
      this.showToast(`🎉 Uang Makan sebesar ${formatRupiah(amt)} berhasil masuk ke Rekening Bank!`, 'success');
    },

    openTxModal(type = 'expense', category = 'pokok', defaultWallet = 'cash') {
      const now = new Date();
      this.txForm = {
        type: type,
        wallet: defaultWallet,
        amount: '',
        category: category,
        note: '',
        date: this.todayStr,
        time: now.toTimeString().split(' ')[0].substring(0, 5)
      };
      this.showTxModal = true;
      this.$nextTick(() => this.initIcons());
    },

    setTxAmount(val) {
      const curr = Number(this.txForm.amount) || 0;
      this.txForm.amount = curr + val;
    },

    saveTransaction() {
      const amt = Number(this.txForm.amount);
      if (!amt || amt <= 0) {
        alert('Silakan masukkan nominal yang valid!');
        return;
      }

      // Validasi saldo jika pengeluaran dari tabungan
      if (this.txForm.type === 'expense' && this.txForm.wallet === 'tabungan') {
        if (this.balanceTabungan < amt) {
          alert(`Saldo Tabungan Anda tidak mencukupi! (Saldo: ${formatRupiah(this.balanceTabungan)})`);
          return;
        }
      }

      if (!this.txForm.note || this.txForm.note.trim() === '') {
        this.txForm.note = this.txForm.type === 'income' ? 'Pemasukan' : (this.txForm.category === 'pokok' ? 'Kebutuhan Pokok' : 'Jajan');
      }

      const newTx = {
        id: 'tx_' + Date.now(),
        date: this.txForm.date,
        time: this.txForm.time,
        type: this.txForm.type,
        wallet: this.txForm.wallet || 'cash',
        category: this.txForm.category,
        amount: amt,
        note: this.txForm.note.trim()
      };

      this.state.transactions.unshift(newTx);
      this.saveState();
      this.showTxModal = false;

      if (newTx.type === 'expense') {
        if (newTx.wallet === 'tabungan') {
          this.showToast(`🐖 Pengeluaran ${formatRupiah(amt)} diambil dari TABUNGAN (tidak memotong kuota belanja harian).`, 'info');
        } else if (this.todayExpenses > this.state.profile.dailyLimit) {
          this.showToast(`⚠️ Belanja tercatat di ${newTx.wallet.toUpperCase()}. Perhatian: Pengeluaran operasional hari ini sudah melebihi batas Rp ${this.state.profile.dailyLimit.toLocaleString('id-ID')}!`, 'danger');
        } else {
          this.showToast(`✅ Pengeluaran ${formatRupiah(amt)} dari ${newTx.wallet === 'cash' ? 'Dompet Cash' : 'Rekening'} berhasil dicatat.`, 'success');
        }
      } else {
        this.showToast(`💰 Pemasukan ${formatRupiah(amt)} masuk ke ${this.getWalletName(newTx.wallet)}!`, 'success');
      }
    },

    deleteTransaction(txId) {
      if (!confirm('Hapus catatan transaksi ini?')) return;
      this.state.transactions = this.state.transactions.filter(t => t.id !== txId);
      this.saveState();
      this.showToast('Transaksi telah dihapus.', 'info');
    },

    // Buka Modal Transfer Cepat (Menabung / Tarik Tunai)
    openTransfer(from = 'rekening', to = 'tabungan', note = 'Menabung Dana Cadangan') {
      this.transferForm = {
        from: from,
        to: to,
        amount: '',
        note: note
      };
      this.showTransferModal = true;
      this.$nextTick(() => this.initIcons());
    },

    executeTransfer() {
      const amt = Number(this.transferForm.amount);
      if (!amt || amt <= 0) {
        alert('Masukkan nominal yang valid!');
        return;
      }
      if (this.transferForm.from === this.transferForm.to) {
        alert('Kantong asal dan tujuan tidak boleh sama!');
        return;
      }

      let sourceBalance = 0;
      if (this.transferForm.from === 'rekening') sourceBalance = this.balanceRekening;
      else if (this.transferForm.from === 'cash') sourceBalance = this.balanceCash;
      else if (this.transferForm.from === 'tabungan') sourceBalance = this.balanceTabungan;

      if (sourceBalance < amt) {
        alert(`Saldo ${this.getWalletName(this.transferForm.from)} tidak mencukupi! (Saldo: ${formatRupiah(sourceBalance)})`);
        return;
      }

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

      // 1. Pengeluaran dari kantong asal
      this.state.transactions.unshift({
        id: 'tx_tf_out_' + Date.now(),
        date: this.todayStr,
        time: timeStr,
        type: 'expense',
        wallet: this.transferForm.from,
        category: 'pokok',
        amount: amt,
        note: this.transferForm.note || `Pindah Dana ke ${this.getWalletName(this.transferForm.to)}`
      });

      // 2. Pemasukan ke kantong tujuan
      this.state.transactions.unshift({
        id: 'tx_tf_in_' + (Date.now() + 1),
        date: this.todayStr,
        time: timeStr,
        type: 'income',
        wallet: this.transferForm.to,
        category: 'tak_terduga',
        amount: amt,
        note: `Terima dari ${this.getWalletName(this.transferForm.from)}`
      });

      this.saveState();
      this.showTransferModal = false;
      this.showToast(`🔄 Berhasil memindahkan ${formatRupiah(amt)} dari ${this.getWalletName(this.transferForm.from)} ke ${this.getWalletName(this.transferForm.to)}!`, 'success');
    },

    completeRoutine(routine) {
      const amt = Number(routine.estCost || 0);
      const note = `Rutin: ${routine.name}`;
      
      const newTx = {
        id: 'tx_' + Date.now(),
        date: this.todayStr,
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: 'expense',
        wallet: routine.wallet || 'cash',
        category: routine.category || 'pokok',
        amount: amt,
        note: note
      };

      this.state.transactions.unshift(newTx);

      const idx = this.state.routineReminders.findIndex(r => r.id === routine.id);
      if (idx !== -1) {
        this.state.routineReminders[idx].lastDoneDate = this.todayStr;
      }

      this.saveState();
      this.showToast(`✅ ${routine.name} selesai & dicatat ${formatRupiah(amt)}. Siklus di-reset!`, 'success');
    },

    payDebtMonth(debt, monthStr) {
      if (!confirm(`Konfirmasi pembayaran ${debt.name} sebesar ${formatRupiah(debt.monthlyAmount)} untuk bulan ${monthStr}?`)) {
        return;
      }

      if (!debt.paidMonths) debt.paidMonths = [];
      if (!debt.paidMonths.includes(monthStr)) {
        debt.paidMonths.push(monthStr);
      }

      const newTx = {
        id: 'tx_debt_' + Date.now(),
        date: this.todayStr,
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: 'expense',
        wallet: 'rekening',
        category: 'cicilan',
        amount: Number(debt.monthlyAmount),
        note: `Pelunasan ${debt.name} (${monthStr})`
      };

      this.state.transactions.unshift(newTx);
      this.saveState();
      this.showToast(`🎉 Pembayaran ${debt.name} (${monthStr}) berhasil dicatat dari Rekening!`, 'success');
    },

    getDebtMonthList(startMonth, endMonth) {
      const list = [];
      const [startYear, startM] = startMonth.split('-').map(Number);
      const [endYear, endM] = endMonth.split('-').map(Number);

      let curY = startYear;
      let curM = startM;

      while (curY < endYear || (curY === endYear && curM <= endM)) {
        list.push(`${curY}-${String(curM).padStart(2, '0')}`);
        curM++;
        if (curM > 12) {
          curM = 1;
          curY++;
        }
      }
      return list;
    },

    saveProfileSettings() {
      this.state.profile.dailyLimit = Number(this.state.profile.dailyLimit) || 50000;
      this.state.profile.gajiPokokEst = Number(this.state.profile.gajiPokokEst) || 0;
      this.state.profile.tukinEst = Number(this.state.profile.tukinEst) || 0;
      this.state.profile.uangMakanEst = Number(this.state.profile.uangMakanEst) || 0;
      this.saveState();
      this.showToast('Pengaturan berhasil disimpan!', 'success');
    },

    printStatement() {
      window.print();
    },

    exportCSV() {
      if (!this.dayByDayStatement || this.dayByDayStatement.length === 0) {
        alert('Belum ada data arus kas untuk diekspor!');
        return;
      }

      let csv = '\uFEFF';
      csv += 'LAPORAN ARUS KAS HARIAN (DAY-BY-DAY CASHFLOW)\n';
      csv += `Dicetak pada: ${new Date().toLocaleString('id-ID')}\n`;
      csv += `Rekening: ${formatRupiah(this.balanceRekening)} | Cash: ${formatRupiah(this.balanceCash)} | Tabungan: ${formatRupiah(this.balanceTabungan)} | Total: ${formatRupiah(this.totalAllFunds)}\n\n`;
      csv += 'Tanggal,Saldo Awal,Pemasukan Rutin,Pemasukan Ekstra/Tak Terduga,Total Masuk,Belanja Pokok,Belanja Jajan,Bayar Cicilan,Keluar Tabungan,Total Keluar,Saldo Akhir,Status Batas Harian\n';

      this.dayByDayStatement.forEach(row => {
        const isOver = row.totalExpense > this.state.profile.dailyLimit;
        const status = isOver ? 'OVER BUDGET' : 'AMAN';
        csv += `"${row.date}","${row.startBalance}","${row.incomeGaji}","${row.incomeExtra}","${row.totalIncome}","${row.expensePokok}","${row.expenseJajan}","${row.expenseCicilan}","${row.expenseTabungan}","${row.totalExpense}","${row.endBalance}","${status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Arus_Kas_Harian_${this.currentMonthStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('File CSV/Excel berhasil diunduh!', 'success');
    },

    downloadBackup() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Backup_DompetKu_${this.todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    restoreBackup(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && parsed.profile && parsed.transactions) {
            this.state = parsed;
            this.saveState();
            this.showToast('Data berhasil dipulihkan dari file backup!', 'success');
          } else {
            alert('Format file backup tidak sesuai.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON backup.');
        }
      };
      reader.readAsText(file);
    },

    resetToDefault() {
      if (confirm('PERINGATAN: Reset ulang seluruh data ke kondisi awal?')) {
        this.state = getDefaultData();
        this.saveState();
        this.showToast('Data berhasil diatur ulang ke kondisi awal.', 'info');
      }
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  Vue.createApp(App).mount('#app');
});
