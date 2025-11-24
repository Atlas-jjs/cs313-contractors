// React Router Imports
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

// Refine Imports
import { Authenticated, Refine } from "@refinedev/core";
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
import { Notifications } from "@mantine/notifications";

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
import { RoleGuard } from "./utils/role-guard";
import { ErrorComponent } from "./pages/ErrorComponent";
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <>
      <MantineProvider>
        <Notifications
          // id="notifications-root"
          position="top-right"
          limit={4}
        />
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
                  {/* Starting Route */}
                  <Route index element={<RoleRedirect />} />

                  {/* Separate Dashboards */}
                  <Route
                    path="/student"
                    element={
                      <RoleGuard allowed={["Student"]}>
                        <StudentDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/instructor"
                    element={
                      <RoleGuard allowed={["Instructor"]}>
                        <InstructorDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/manage"
                    element={
                      <RoleGuard allowed={["Admin"]}>
                        <AdminDashboard />
                      </RoleGuard>
                    }
                  />

                  {/* Calendar */}
                  <Route path="/calendar">
                    <Route
                      index
                      element={
                        <RoleGuard allowed={["Student", "Instructor", "Admin"]}>
                          <CalendarList />
                        </RoleGuard>
                      }
                    ></Route>
                    <Route
                      element={
                        <RoleGuard allowed={["Student", "Instructor", "Admin"]}>
                          <CalendarShow />
                        </RoleGuard>
                      }
                    ></Route>
                  </Route>
                  {/* History */}
                  <Route path="/history">
                    <Route
                      index
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <HistoryList />
                        </RoleGuard>
                      }
                    ></Route>
                    <Route
                      path="show/:id"
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <HistoryShow />
                        </RoleGuard>
                      }
                    />
                  </Route>
                  {/* User */}
                  <Route path="/user">
                    <Route
                      index
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <UserList />
                        </RoleGuard>
                      }
                    ></Route>
                    <Route
                      path="show/:id"
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <UserShow />
                        </RoleGuard>
                      }
                    />
                  </Route>
                  {/* Reservation */}
                  <Route path="/reservation">
                    <Route
                      index
                      element={
                        <RoleGuard allowed={["Admin", "Student", "Instructor"]}>
                          <ReservationList />
                        </RoleGuard>
                      }
                    ></Route>
                    <Route path="create" element={<ReservationCreate />} />
                    <Route
                      path="show/:id"
                      element={
                        <RoleGuard allowed={["Admin", "Student", "Instructor"]}>
                          <ReservationShow />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <RoleGuard allowed={["Student", "Instructor"]}>
                          <ReservationEdit />
                        </RoleGuard>
                      }
                    />
                  </Route>
                  {/* Room */}
                  <Route path="/room">
                    <Route
                      index
                      element={
                        <RoleGuard allowed={["Admin", "Student", "Instructor"]}>
                          <RoomList />
                        </RoleGuard>
                      }
                    ></Route>
                    <Route
                      path="create"
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <RoomCreate />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="show/:id"
                      element={
                        <RoleGuard allowed={["Admin", "Student", "Instructor"]}>
                          <RoomShow />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <RoleGuard allowed={["Admin"]}>
                          <RoomEdit />
                        </RoleGuard>
                      }
                    />
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
      </MantineProvider>
    </>
  );
}

export default App;
