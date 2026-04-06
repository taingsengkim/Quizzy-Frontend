import { configureStore } from '@reduxjs/toolkit'
import { quizzy } from './features/api/api'

export const makeStore = () => {
  return configureStore({
    reducer: {
            [quizzy.reducerPath]:quizzy.reducer 

    },
     middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(quizzy.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']