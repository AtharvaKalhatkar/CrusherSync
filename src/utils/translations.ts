export type Language = 'en' | 'mr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.parties': 'Parties',
    'nav.items': 'Items',
    'nav.bills': 'Bills',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.overview': 'Overview',
    'dashboard.totalSales': 'Total Sales (Cash In)',
    'dashboard.thisMonthSale': 'This Month Sale',
    'dashboard.lastMonthSale': 'Last Month Sale',
    'dashboard.thisYearSale': 'This Year Sale',
    'dashboard.parties': 'Parties',
    'dashboard.invoices': 'Invoices',
    'dashboard.itemsInStock': 'Items / Products in Stock',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newInvoice': '+ New Invoice',
    'dashboard.addPayment': '+ Add Payment',

    // Customers
    'customers.title': 'Parties',
    'customers.addParty': 'Add Party',
    'customers.cancel': 'Cancel',
    'customers.nameLabel': 'Customer Name',
    'customers.namePlaceholder': 'Enter name',
    'customers.phoneLabel': 'Phone Number',
    'customers.phonePlaceholder': 'Enter mob no',
    'customers.save': 'Save Customer',
    'customers.noCustomers': 'No customers found. Add a customer to get started.',
    'customers.deliveries': 'Deliveries / Challans',
    'customers.logDelivery': 'Log Delivery',
    'customers.generateBill': 'Generate Bill',
    'customers.unbilledDeliveries': 'Unbilled Deliveries',
    'customers.vehicleNo': 'Vehicle No.',
    'customers.selectProduct': 'Select Product',
    'customers.quantity': 'Quantity',

    // General
    'app.title': 'Stone Crusher',
    'app.subtitle': 'Shree Kalbhairavnath',
    'app.dashboard': 'Dashboard',

    // Settings
    'settings.title': 'Company Settings',
    'settings.businessName': 'Business Name',
    'settings.businessSubtitle': 'Business Subtitle',
    'settings.phone': 'Phone Number',
    'settings.email': 'Email ID',
    'settings.gst': 'GST Number',
    'settings.logo': 'Company Logo',
    'settings.signature': 'Authorized Signature',
    'settings.save': 'Save Settings',
  },
  mr: {
    // Navigation
    'nav.home': 'होम',
    'nav.parties': 'ग्राहक',
    'nav.items': 'वस्तू',
    'nav.bills': 'बिले',
    'nav.settings': 'सेटिंग्ज',

    // Dashboard
    'dashboard.overview': 'आढावा',
    'dashboard.totalSales': 'एकूण विक्री (मिळालेली रक्कम)',
    'dashboard.thisMonthSale': 'या महिन्याची विक्री',
    'dashboard.lastMonthSale': 'मागील महिन्याची विक्री',
    'dashboard.thisYearSale': 'या वर्षाची विक्री',
    'dashboard.parties': 'ग्राहक',
    'dashboard.invoices': 'पावत्या',
    'dashboard.itemsInStock': 'स्टॉकमधील वस्तू',
    'dashboard.quickActions': 'जलद क्रिया',
    'dashboard.newInvoice': '+ नवीन पावती',
    'dashboard.addPayment': '+ पेमेंट जोडा',

    // Customers
    'customers.title': 'ग्राहक',
    'customers.addParty': 'ग्राहक जोडा',
    'customers.cancel': 'रद्द करा',
    'customers.nameLabel': 'ग्राहकाचे नाव',
    'customers.namePlaceholder': 'नाव प्रविष्ट करा',
    'customers.phoneLabel': 'फोन नंबर',
    'customers.phonePlaceholder': 'मोबाईल नंबर प्रविष्ट करा',
    'customers.save': 'ग्राहक जतन करा',
    'customers.noCustomers': 'कोणतेही ग्राहक आढळले नाहीत. प्रारंभ करण्यासाठी ग्राहक जोडा.',
    'customers.deliveries': 'डिलिव्हरी / कच्चे बिल',
    'customers.logDelivery': 'डिलिव्हरी नोंदवा',
    'customers.generateBill': 'बिल तयार करा',
    'customers.unbilledDeliveries': 'बिल न झालेल्या डिलिव्हरीज',
    'customers.vehicleNo': 'वाहन क्रमांक',
    'customers.selectProduct': 'वस्तू निवडा',
    'customers.quantity': 'प्रमाण',

    // General
    'app.title': 'स्टोन क्रशर',
    'app.subtitle': 'श्री काळभैरवनाथ',
    'app.dashboard': 'डॅशबोर्ड',
    
    // Settings
    'settings.title': 'कंपनी सेटिंग्ज',
    'settings.businessName': 'व्यवसायाचे नाव',
    'settings.businessSubtitle': 'व्यवसायाचे उपनाव',
    'settings.phone': 'फोन नंबर',
    'settings.email': 'ईमेल आयडी',
    'settings.gst': 'जीएसटी क्रमांक',
    'settings.logo': 'कंपनीचा लोगो',
    'settings.signature': 'अधिकृत स्वाक्षरी',
    'settings.save': 'सेटिंग्ज जतन करा',
  }
};
