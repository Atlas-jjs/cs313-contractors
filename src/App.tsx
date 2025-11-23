// React Router Imports
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

// Refine Imports
import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import routerProvider, {
  // CatchAllNavigate,
  // NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

// Supabase Import
import supabaseClient from "./config/supabaseClient";
import { authProvider } from "./providers/auth-provider";

// Components
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import RoleRedirect from "./utils/role-redirect";
import { Layout } from "./components/layout/Layout";

// Pages
import { UserList, UserShow } from "./pages/users";
import { Suspended } from "./pages/Suspended";
import {
  ReservationCreate,
  ReservationList,
  ReservationShow,
} from "./pages/reservations";
import { resources } from "./utils/resources";
import { RoomCreate, RoomEdit, RoomList, RoomShow } from "./pages/rooms";
import { ReservationEdit } from "./pages/reservations/edit";
import { HistoryList, HistoryShow } from "./pages/history";
import { InstructorDashboard } from "./pages/InstructorDashboard";
import { CalendarShow } from "./pages/calendar/show";
import { CalendarList } from "./pages/calendar";
// import { ErrorComponent } from "./pages/ErrorComponent";

function App() {
  return (
    <>
      <BrowserRouter>
        <RefineKbarProvider>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            liveProvider={liveProvider(supabaseClient)}
            routerProvider={routerProvider}
            authProvider={authProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              liveMode: "auto",
            }}
          >
            <Routes>
              <Route path="/suspended" element={<Suspended />} />
              <Route
                element={
                  <Authenticated
                    key="authenticated-inner"
                    // fallback={<CatchAllNavigate to="/login" />} // ! Temporary
                  >
                    <Layout>
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                <Route index element={<RoleRedirect />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/manage" element={<AdminDashboard />} />
                <Route path="/calendar">
                  <Route index element={<CalendarList />}></Route>
                  <Route element={<CalendarShow />}></Route>
                </Route>
                <Route path="/history">
                  <Route index element={<HistoryList />}></Route>
                  <Route path="show/:id" element={<HistoryShow />} />
                </Route>
                <Route path="/user">
                  <Route index element={<UserList />}></Route>
                  <Route path="show/:id" element={<UserShow />} />
                </Route>
                <Route path="/reservation">
                  <Route index element={<ReservationList />}></Route>
                  <Route path="create" element={<ReservationCreate />} />
                  <Route path="show/:id" element={<ReservationShow />} />
                  <Route path="edit/:id" element={<ReservationEdit />} />
                </Route>
                <Route path="/room">
                  <Route index element={<RoomList />}></Route>
                  <Route path="create" element={<RoomCreate />} />
                  <Route path="show/:id" element={<RoomShow />} />
                  <Route path="edit/:id" element={<RoomEdit />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated
                    key="authenticated-outer"
                    fallback={<Outlet />}
                  >
                    <Navigate to="/" replace />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
          </Refine>
        </RefineKbarProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
