package main

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

/*
 * Sub-API for the kanban board. Attached to base router ("/v1/kanban")
 */
func kanbanAPI(r chi.Router) {
	r.Use(RequireAccount())

	r.Get("/", getKanbanBoards)

	r.Route("/{ID}", func(r chi.Router) {

		r.Group(func(r chi.Router) {
			r.Get("/", getKanbanBoardExtended)
		})

		r.Group(func(r chi.Router) {
			r.Use(RequireEditor())
			r.Post("/", createKanbanBoard)
		})

		r.Group(func(r chi.Router) {
			r.Use(RequireEditor())
			r.Get("/swimlane/{SL}", getSwimLane)
		})

		r.Group(func(r chi.Router) {
			r.Use(RequireEditor())
			r.Post("/swimlane", createSwimLane)
		})

	})
}

// Boards

type createKanbanBoardRequest struct {
	Title string `json:"title"`
}

func (p *createKanbanBoardRequest) Bind(r *http.Request) error {
	return nil
}

func createKanbanBoard(w http.ResponseWriter, r *http.Request) {
	data := &createKanbanBoardRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	s := GetEnv(r).Service
	p, err := s.CreateKanbanBoardWithID(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, p)

}

func getKanbanBoards(w http.ResponseWriter, r *http.Request) {
	s := GetEnv(r).Service
	render.JSON(w, r, s.GetKanbanBoards())
}

type kanbanResponse struct {
	KanbanBoard *KanbanBoard `json:"kanbanboard"`
	Swimlanes   []*SwimLane  `json:"swimlanes"`
}

// should read the complete board dependencies
func getKanbanBoardExtended(w http.ResponseWriter, r *http.Request) {

	s := GetEnv(r).Service
	id := chi.URLParam(r, "ID")

	kanbanboard := s.GetKanbanBoard(id)
	swimlanes := s.GetSwimLanesByBoard(id)

	oo := kanbanResponse{
		KanbanBoard: kanbanboard,
		Swimlanes:   swimlanes,
	}

	render.JSON(w, r, oo)
}

// swimlanes
type createSwimLaneRequest struct {
	Title string `json:"title"`
}

func (p *createSwimLaneRequest) Bind(r *http.Request) error {
	return nil
}

func createSwimLane(w http.ResponseWriter, r *http.Request) {
	data := &createSwimLaneRequest{}
	if err := render.Bind(r, data); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	id := chi.URLParam(r, "ID")

	s := GetEnv(r).Service
	p, err := s.CreateSwimLaneWithID(id, data.Title)
	if err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	render.JSON(w, r, p)

}

func getSwimLane(w http.ResponseWriter, r *http.Request) {
	s := GetEnv(r).Service
	//	kb := chi.URLParam(r, "KB")
	sl := chi.URLParam(r, "SL")

	render.JSON(w, r, s.GetSwimLane(sl))
}
