package main

import (
	"github.com/kkserver/kk-lib/kk"
	"github.com/kkserver/kk-lib/kk/app"
	"github.com/kkserver/kk-lib/kk/app/client"
	"github.com/kkserver/kk-lib/kk/app/logic"
	"github.com/kkserver/kk-lib/kk/json"
	"log"
	"net/http"
	"os"
	"strings"
)

type MainApp struct {
	app.App
	Client  *client.Service
	Address string
	Timeout int
}

func main() {

	log.SetFlags(log.Llongfile | log.LstdFlags)

	env := "./config/env.ini"

	if len(os.Args) > 1 {
		env = os.Args[1]
	}

	a := MainApp{}

	err := app.Load(&a, "./app.ini")

	if err != nil {
		log.Panicln(err)
	}

	err = app.Load(&a, env)

	if err != nil {
		log.Panicln(err)
	}

	app.Obtain(&a)

	app.Handle(&a, &app.InitTask{})

	go func() {

		programs := map[string]logic.IProgram{}

		getProgram := func(path string) (logic.IProgram, error) {

			p, ok := programs[path]

			if ok {
				return p, nil
			}

			p, err := logic.NewYamlProgram(path)

			if err != nil {
				return nil, err
			}

			programs[path] = p

			return p, nil
		}

		getContext := func(w http.ResponseWriter, r *http.Request) *logic.LuaContext {

			ctx := logic.NewLuaContext()

			input := map[string]interface{}{}

			if r.Method == "POST" {

				if r.Header.Get("Content-Type") == "text/json" {
					var body = make([]byte, r.ContentLength)
					_, _ = r.Body.Read(body)
					defer r.Body.Close()
					_ = json.Decode(body, input)
				} else {
					r.ParseForm()
					for key, values := range r.Form {
						input[key] = values[0]
					}
				}

			} else {

				r.ParseForm()

				for key, values := range r.Form {
					input[key] = values[0]
				}

			}

			ctx.Set([]string{"method"}, r.Method)
			ctx.Set(logic.InputKeys, input)

			return ctx
		}

		fs := http.FileServer(http.Dir("./web"))
		static_fs := http.FileServer(http.Dir("."))

		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

			if strings.HasPrefix(r.URL.Path, "/static/") {
				static_fs.ServeHTTP(w, r)
			} else if strings.HasSuffix(r.URL.Path, ".json") {

				path := "./web" + r.URL.Path[0:len(r.URL.Path)-5] + ".yaml"

				p, err := getProgram(path)

				if err != nil {
					w.WriteHeader(http.StatusNotFound)
					w.Write([]byte(err.Error()))
				} else {
					ctx := getContext(w, r)
					ctx.Begin()
					defer ctx.End()
					defer ctx.Close()
					err = logic.Exec(&a, p, ctx)
					if err != nil {
						b, _ := json.Encode(map[string]interface{}{"errno": logic.ERROR_UNKNOWN, "errmsg": err.Error()})
						w.Header().Add("Content-Type", "application/json; charset=utf-8")
						w.Write(b)
					} else {

						b, _ := json.Encode(ctx.Get(logic.OutputKeys))
						w.Header().Add("Content-Type", "application/json; charset=utf-8")
						w.Write(b)

					}
				}

			} else if strings.HasSuffix(r.URL.Path, ".lhtml") {

				path := "./web" + r.URL.Path[0:len(r.URL.Path)-6] + ".yaml"

				p, err := getProgram(path)

				if err != nil {
					w.WriteHeader(http.StatusNotFound)
					w.Write([]byte(err.Error()))
				} else {
					ctx := getContext(w, r)
					ctx.Begin()
					defer ctx.End()
					defer ctx.Close()
					err = logic.Exec(&a, p, ctx)
					if err != nil {
						w.WriteHeader(http.StatusInternalServerError)
						w.Write([]byte(err.Error()))
					} else {

						view := ctx.Get(logic.ViewKeys)

						if view == nil {
							w.WriteHeader(http.StatusNotFound)
							w.Write([]byte("Not Found"))
						} else {
							v, ok := view.(*logic.View)
							if ok {

								if v.ContentType == "" {
									v.ContentType = "text/html; charset=utf-8"
								}
								w.Header().Add("Content-Type", v.ContentType)
								w.Write(v.Content)
							} else {
								w.WriteHeader(http.StatusNotFound)
								w.Write([]byte("Not Found"))
							}
						}

					}
				}

			} else {
				fs.ServeHTTP(w, r)
			}

		})

		log.Println("httpd " + a.Address)

		log.Fatal(http.ListenAndServe(a.Address, nil))

	}()

	kk.DispatchMain()

	app.Recycle(&a)

}
