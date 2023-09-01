/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList[0]).toEqual("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("if bills data are not ok, the error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: 'error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
    test("if bills data are loading, the loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()

    })

    describe("When clicking on the iconEye icon", () => {
      test("The modal window should open",  () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills })

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const allBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })

        $.fn.modal = jest.fn();

        const icon = screen.getAllByTestId('icon-eye')[0];

        const handleClickIconEye = jest.fn(() => allBills.handleClickIconEye(icon))

        icon.addEventListener("click", handleClickIconEye);
        userEvent.click(icon);

        expect(handleClickIconEye).toHaveBeenCalled();

        const modal = screen.getByText("Justificatif");
        // console.log(modal.classList);
        expect(modal).toBeTruthy();
      })
    })
    describe("When clicking on the 'New Bill' button", () => {
      test("we should be redirect to the 'New Bill' form", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
        }))

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const bills = new Bills({document, onNavigate, store: null, localStorage: window.localStorage})

        document.body.innerHTML = BillsUI({ data: bills })


        const newBillBtn = screen.getByTestId('btn-new-bill');

        const handleClickNewBill = jest.fn(() => bills.handleClickNewBill());

        newBillBtn.addEventListener("click", handleClickNewBill);
        userEvent.click(newBillBtn);

        const form = screen.getByText("Envoyer une note de frais");
        expect(form).toBeTruthy();
      })
    })
  })
})

// test d'intégration GET



describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to 'Mes notes de frais' page", () => {
    test("Then it should fetches bills form mock API GET", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock});

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      console.log(document.body.innerHTML);

      const billsTab = await screen.getByTestId("tbody");
      expect(billsTab).toBeTruthy();

      await waitFor(() => screen.getByText("Mes notes de frais"))
      const title = screen.getByText("Mes notes de frais");
      expect(title).toBeTruthy()
      const btn  = screen.getByText("Nouvelle note de frais")
      expect(btn).toBeTruthy()
      // expect(screen.getByTestId("tbody")).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })


  })
})
