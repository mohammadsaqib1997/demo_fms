import PageNotFound from '../pages/error/error.vue'
import app from './app.vue'

import loginLayout from '../partials/layouts/loginLayout/loginLayout.vue'
import login from '../pages/login/login.vue'
import lockAccount from '../pages/lock_account/lock_account.vue'

import dashboardLayout from '../partials/layouts/dashboardLayout/dashboardLayout.vue'
import dashboard from '../pages/dashboard/dashboard.vue'

import masterDetails from '../pages/master_files/master_details/master_details.vue'
import control from '../pages/master_files/chart_of_accounts/control/control.vue'
import subControl from '../pages/master_files/chart_of_accounts/sub_control/sub_control.vue'
import subsidiary from '../pages/master_files/chart_of_accounts/subsidiary/subsidiary.vue'

import listingControl from '../pages/master_listing/list_chart_of_accounts/list_control/list_control.vue'
import listingSubControl from '../pages/master_listing/list_chart_of_accounts/list_sub_control/list_sub_control.vue'
import listingSubsidiary from '../pages/master_listing/list_chart_of_accounts/list_subsidiary/list_subsidiary.vue'

import journalVoucher from '../pages/transaction_files/journal_voucher/journal_voucher.vue'

import postUnPost from '../pages/process/post_unpost/post_unpost.vue'

import createNewUser from '../pages/user_control/create_new_user/create_new_user.vue'
import editUser from '../pages/user_control/edit_user/edit_user.vue'
import profile from '../pages/profile/profile.vue'

import partyInformation from '../pages/party_information/party_information.vue'

import detailedLedger from '../pages/mis_reports/detailed_ledger/detailed_ledger.vue'
import balListControl from '../pages/mis_reports/balance_sheet/list_control/list_control.vue'
import balListSubControl from '../pages/mis_reports/balance_sheet/list_sub_control/list_sub_control.vue'
import balListSubsidiary from '../pages/mis_reports/balance_sheet/list_subsidiary/list_subsidiary.vue'
import tBalListControl from '../pages/mis_reports/trial_balance/list_control/list_control.vue'
import tBalListSubControl from '../pages/mis_reports/trial_balance/list_sub_control/list_sub_control.vue'
import tBalListSubsidiary from '../pages/mis_reports/trial_balance/list_subsidiary/list_subsidiary.vue'

import searchMasterDetail from '../pages/search/master_detail/master_detail.vue'
import searchPartyInfo from '../pages/search/party_information/party_information.vue'
import searchJournalVoucher from '../pages/search/journal_voucher/journal_voucher.vue'

import sheetLayout from '../partials/layouts/sheetLayout/sheetLayout.vue'
import controlSheet from '../pages/sheets/list_control/list_control.vue'
import subControlSheet from '../pages/sheets/list_sub_control/list_sub_control.vue'
import subsidiarySheet from '../pages/sheets/list_subsidiary/list_subsidiary.vue'

import controlBSheet from '../pages/sheets/bs_control/bs_control.vue'
import subControlBSheet from '../pages/sheets/bs_sub_control/bs_sub_control.vue'
import subsidiaryBSheet from '../pages/sheets/bs_subsidiary/bs_subsidiary.vue'

import controlTBSheet from '../pages/sheets/tbal_control/tbal_control.vue'
import subControlTBSheet from '../pages/sheets/tbal_sub_control/tbal_sub_control.vue'
import subsidiaryTBSheet from '../pages/sheets/tbal_subsidiary/tbal_subsidiary.vue'

import detailLedgerSheet from '../pages/sheets/detail_ledger/detail_ledger.vue'

import paymentPlanSheet from '../pages/sheets/payment_plan/payment_plan.vue'

const routes = [
    {
        path: '/',
        component: app,
        children: [
            {
                path: '',
                component: dashboardLayout,
                meta: {
                    requiresAuth: true
                },
                children: [
                    {
                        path: '',
                        component: dashboard
                    },
                    {
                        path: '/master_details',
                        component: masterDetails
                    },
                    {
                        path: '/create_control',
                        component: control
                    },
                    {
                        path: '/create_sub_control',
                        component: subControl
                    },
                    {
                        path: '/create_subsidiary',
                        component: subsidiary
                    },
                    {
                        path: '/listing_control',
                        component: listingControl
                    },
                    {
                        path: '/listing_sub_control',
                        component: listingSubControl
                    },
                    {
                        path: '/listing_subsidiary',
                        component: listingSubsidiary
                    },
                    {
                        path: '/detailed_ledger',
                        component: detailedLedger
                    },
                    {
                        path: '/balance_sheet/list_control',
                        component: balListControl
                    },
                    {
                        path: '/balance_sheet/list_sub_control',
                        component: balListSubControl
                    },
                    {
                        path: '/balance_sheet/list_subsidiary',
                        component: balListSubsidiary
                    },
                    {
                        path: '/trial_balance/list_control',
                        component: tBalListControl
                    },
                    {
                        path: '/trial_balance/list_sub_control',
                        component: tBalListSubControl
                    },
                    {
                        path: '/trial_balance/list_subsidiary',
                        component: tBalListSubsidiary
                    },
                    {
                        path: '/journal_voucher',
                        component: journalVoucher
                    },
                    {
                        path: '/post_unpost',
                        component: postUnPost,
                        meta: {
                            admin: true
                        }
                    },
                    {
                        path: '/create_new_user',
                        component: createNewUser,
                        meta: {
                            admin: true
                        }
                    },
                    {
                        path: '/edit_user/:id',
                        component: editUser,
                        meta: {
                            admin: true
                        }
                    },
                    {
                        path: '/profile',
                        component: profile
                    },
                    {
                        path: '/add_party',
                        component: partyInformation
                    },
                    {
                        path: '/search/master_detail/:id',
                        component: searchMasterDetail
                    },
                    {
                        path: '/search/journal_voucher/:id',
                        component: searchJournalVoucher
                    },
                    {
                        path: '/search/vendor_detail/:id',
                        component: searchPartyInfo
                    }
                ]
            },
            {
                path: 'sheet',
                component: sheetLayout,
                meta: {
                    requiresAuth: true
                },
                children: [
                    {
                        path: 'control/:proId/:startId/:endId',
                        component: controlSheet,
                    },
                    {
                        path: 'sub_control/:proId/:startId/:endId',
                        component: subControlSheet,
                    },
                    {
                        path: 'subsidiary/:proId/:startId/:endId',
                        component: subsidiarySheet,
                    },
                    {
                        path: 'bs_control/:proId/:startDate/:endDate',
                        component: controlBSheet,
                    },
                    {
                        path: 'bs_sub_control/:proId/:startDate/:endDate',
                        component: subControlBSheet,
                    },
                    {
                        path: 'bs_subsidiary/:proId/:startDate/:endDate',
                        component: subsidiaryBSheet,
                    },
                    {
                        path: 'trial_bal_control/:proId/:startDate/:endDate',
                        component: controlTBSheet,
                    },
                    {
                        path: 'trial_bal_sub_control/:proId/:startDate/:endDate',
                        component: subControlTBSheet,
                    },
                    {
                        path: 'trial_bal_subsidiary/:proId/:startDate/:endDate',
                        component: subsidiaryTBSheet,
                    },
                    {
                        path: 'detail_ledger/:proId/:subsId/:startDate/:endDate',
                        component: detailLedgerSheet,
                    },
                    {
                        path: 'payment_plan/:mdId',
                        component: paymentPlanSheet,
                    }
                ]
            },
            {
                path: 'login',
                component: loginLayout,
                children: [
                    {path: '', component: login},
                ]
            },
            {
                path: 'lock_account',
                component: loginLayout,
                children: [
                    {path: '', component: lockAccount},
                ]
            },
            {
                path: '*',
                component: dashboardLayout,
                children: [
                    {
                        path: '',
                        component: PageNotFound
                    },
                ]
            }
        ]
    }
];

module.exports = routes;